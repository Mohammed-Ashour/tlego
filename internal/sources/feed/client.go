// Package feed is the shared base for data source modules: how a source is described,
// and a polite client that caches responses and backs off when a provider fails.
package feed

import (
	"context"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/Mohammed-Ashour/khonsu/internal/catalog"
)

const (
	UserAgent      = "Khonsu (+https://github.com/Mohammed-Ashour/Khonsu)"
	maxResponse    = 8 << 20
	requestTimeout = 25 * time.Second
	failurePause   = 15 * time.Minute
	longestPause   = 6 * time.Hour
)

// Meta says how current a result is.
type Meta struct {
	FetchedAt time.Time `json:"fetched_at"`
	Stale     bool      `json:"stale"`
	Warning   string    `json:"warning,omitempty"`
}

// Client fetches provider data politely. Each provider gets one request at a time,
// a response is reused until it expires, and a provider that fails is left alone
// for a while. Saved data is served while that happens.
type Client struct {
	http   *http.Client
	dir    string
	dirErr error
	// Clock supplies the time. Tests may replace it before first use.
	Clock func() time.Time

	mu    sync.Mutex
	gates map[string]*gate
}

type gate struct {
	slot         chan struct{}
	blockedUntil time.Time
}

// NewClient stores responses under cacheDir, or the user cache when it is empty.
func NewClient(cacheDir string) *Client {
	client := &Client{http: &http.Client{}, Clock: time.Now, gates: map[string]*gate{}}
	if cacheDir == "" {
		cacheDir, client.dirErr = catalog.DefaultCacheDir()
	}
	client.dir = filepath.Join(cacheDir, "sources")
	return client
}

// Request describes one provider response to fetch or reuse.
type Request struct {
	Source, Key, URL, Accept string
	TTL                      time.Duration
	// Validate runs before a response is saved, so bad data cannot replace good data.
	Validate func([]byte) error
	// Optional: the saved file's extension (default json), a larger response or
	// time limit, a client holding session cookies, and a step to run first.
	Ext      string
	MaxBytes int64
	Timeout  time.Duration
	HTTP     *http.Client
	Prepare  func(context.Context) error
}

func (r Request) savedPath(dir string) string {
	ext := r.Ext
	if ext == "" {
		ext = "json"
	}
	return filepath.Join(dir, r.Source, r.Key+"."+ext)
}

func (c *Client) gateFor(source string) *gate {
	c.mu.Lock()
	defer c.mu.Unlock()
	if c.gates[source] == nil {
		c.gates[source] = &gate{slot: make(chan struct{}, 1)}
	}
	return c.gates[source]
}

// Fetch returns the saved response while it is fresh and otherwise asks the provider,
// one request at a time per source.
func (c *Client) Fetch(ctx context.Context, r Request) ([]byte, Meta, error) {
	if c.dirErr != nil {
		return nil, Meta{}, fmt.Errorf("resolve cache directory: %w", c.dirErr)
	}
	path := r.savedPath(c.dir)
	if body, meta, ok := c.readSaved(path, r); ok && c.Now().Sub(meta.FetchedAt) <= r.TTL {
		return body, meta, nil
	}
	providerGate := c.gateFor(r.Source)
	select {
	case providerGate.slot <- struct{}{}:
		defer func() { <-providerGate.slot }()
	case <-ctx.Done():
		return nil, Meta{}, ctx.Err()
	}
	// Another request may have refreshed this while we waited for the provider.
	saved, meta, haveSaved := c.readSaved(path, r)
	if haveSaved && c.Now().Sub(meta.FetchedAt) <= r.TTL {
		return saved, meta, nil
	}
	var err error
	if c.Now().Before(providerGate.blockedUntil) {
		err = errors.New("the provider recently failed, so Khonsu is waiting before trying again")
	} else {
		var body []byte
		var pause time.Duration
		body, pause, err = c.download(ctx, r)
		if err == nil {
			if err = r.Validate(body); err != nil {
				err = fmt.Errorf("unexpected response: %w", err)
			}
		}
		if err == nil {
			if err = writeSaved(path, body); err != nil {
				return nil, Meta{}, err
			}
			return body, Meta{FetchedAt: c.Now().UTC()}, nil
		}
		if ctx.Err() != nil {
			return nil, Meta{}, ctx.Err()
		}
		providerGate.blockedUntil = c.Now().Add(pause)
	}
	if haveSaved {
		meta.Stale, meta.Warning = true, "Showing saved data because the provider could not be reached."
		return saved, meta, nil
	}
	return nil, Meta{}, err
}

func (c *Client) download(ctx context.Context, r Request) ([]byte, time.Duration, error) {
	timeout, limit, client := r.Timeout, r.MaxBytes, r.HTTP
	if timeout == 0 {
		timeout = requestTimeout
	}
	if limit == 0 {
		limit = maxResponse
	}
	if client == nil {
		client = c.http
	}
	ctx, cancel := context.WithTimeout(ctx, timeout)
	defer cancel()
	if r.Prepare != nil {
		if err := r.Prepare(ctx); err != nil {
			return nil, longestPause, err
		}
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, r.URL, nil)
	if err != nil {
		return nil, failurePause, err
	}
	req.Header.Set("User-Agent", UserAgent)
	if r.Accept != "" {
		req.Header.Set("Accept", r.Accept)
	}
	response, err := client.Do(req)
	if err != nil {
		return nil, failurePause, err
	}
	defer response.Body.Close()
	if response.StatusCode != http.StatusOK {
		return nil, retryPause(response.Header.Get("Retry-After")), fmt.Errorf("provider returned HTTP %d", response.StatusCode)
	}
	body, err := io.ReadAll(io.LimitReader(response.Body, limit+1))
	if err != nil {
		return nil, failurePause, err
	}
	if int64(len(body)) > limit {
		return nil, failurePause, errors.New("provider response is too large")
	}
	return body, 0, nil
}

func retryPause(header string) time.Duration {
	seconds, err := strconv.Atoi(header)
	if err != nil || seconds <= 0 {
		return failurePause
	}
	return min(time.Duration(seconds)*time.Second, longestPause)
}

func (c *Client) readSaved(path string, r Request) ([]byte, Meta, bool) {
	info, err := os.Stat(path)
	if err != nil {
		return nil, Meta{}, false
	}
	body, err := os.ReadFile(path)
	if err != nil || r.Validate(body) != nil {
		return nil, Meta{}, false
	}
	return body, Meta{FetchedAt: info.ModTime().UTC()}, true
}

func writeSaved(path string, body []byte) error {
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		return err
	}
	file, err := os.CreateTemp(filepath.Dir(path), "response-*.tmp")
	if err != nil {
		return err
	}
	defer os.Remove(file.Name())
	_, err = file.Write(body)
	if closeErr := file.Close(); err == nil {
		err = closeErr
	}
	if err != nil {
		return err
	}
	return os.Rename(file.Name(), path)
}

// Now returns the client's current time.
func (c *Client) Now() time.Time { return c.Clock() }

// Get fetches a response and parses it. Parsing runs before anything is saved.
func Get[T any](ctx context.Context, c *Client, r Request, parse func([]byte) (T, error)) (T, Meta, error) {
	r.Validate = func(body []byte) error {
		_, err := parse(body)
		return err
	}
	var zero T
	body, meta, err := c.Fetch(ctx, r)
	if err != nil {
		return zero, meta, err
	}
	value, err := parse(body)
	return value, meta, err
}

// ParseUTC reads a provider timestamp that has no zone and is in UTC.
func ParseUTC(layout, value string) (time.Time, error) {
	return time.ParseInLocation(layout, value, time.UTC)
}

// Merge folds one part's freshness into a combined result, which is as old as its oldest part.
func Merge(total *Meta, part Meta) {
	if total.FetchedAt.IsZero() || part.FetchedAt.Before(total.FetchedAt) {
		total.FetchedAt = part.FetchedAt
	}
	total.Stale = total.Stale || part.Stale
	if total.Warning == "" {
		total.Warning = part.Warning
	}
}

// CanonicalID validates a NORAD catalog number and removes leading zeros, so the
// value is safe to place in a provider query.
func CanonicalID(id string) (string, error) {
	if err := catalog.ValidateNoradID(id); err != nil {
		return "", err
	}
	return strings.TrimLeft(id, "0"), nil
}
