package sources

import (
	"context"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"sync"
	"time"

	"github.com/Mohammed-Ashour/khonsu/internal/catalog"
)

const (
	userAgent      = "Khonsu (+https://github.com/Mohammed-Ashour/Khonsu)"
	maxResponse    = 8 << 20
	requestTimeout = 25 * time.Second
	failurePause   = 15 * time.Minute
	longestPause   = 6 * time.Hour
)

// Endpoints holds provider base URLs, which tests replace.
type Endpoints struct {
	SWPC, Wikidata, SatNOGS, LaunchLibrary string
}

// DefaultEndpoints are the production provider URLs.
func DefaultEndpoints() Endpoints {
	return Endpoints{
		SWPC:          "https://services.swpc.noaa.gov",
		Wikidata:      "https://query.wikidata.org/sparql",
		SatNOGS:       "https://db.satnogs.org/api",
		LaunchLibrary: "https://ll.thespacedevs.com/2.3.0",
	}
}

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
	http      *http.Client
	dir       string
	dirErr    error
	endpoints Endpoints
	now       func() time.Time

	mu    sync.Mutex
	gates map[string]*gate
}

type gate struct {
	slot         chan struct{}
	blockedUntil time.Time
}

// NewClient stores responses under cacheDir, or the user cache when it is empty.
func NewClient(cacheDir string) *Client {
	client := &Client{http: &http.Client{Timeout: requestTimeout}, endpoints: DefaultEndpoints(), now: time.Now, gates: map[string]*gate{}}
	if cacheDir == "" {
		cacheDir, client.dirErr = catalog.DefaultCacheDir()
	}
	client.dir = filepath.Join(cacheDir, "sources")
	return client
}

type request struct {
	source, key, url, accept string
	ttl                      time.Duration
	validate                 func([]byte) error
}

func (c *Client) gateFor(source string) *gate {
	c.mu.Lock()
	defer c.mu.Unlock()
	if c.gates[source] == nil {
		c.gates[source] = &gate{slot: make(chan struct{}, 1)}
	}
	return c.gates[source]
}

func (c *Client) fetch(ctx context.Context, r request) ([]byte, Meta, error) {
	if c.dirErr != nil {
		return nil, Meta{}, fmt.Errorf("resolve cache directory: %w", c.dirErr)
	}
	path := filepath.Join(c.dir, r.source, r.key+".json")
	if body, meta, ok := c.readSaved(path, r); ok && c.now().Sub(meta.FetchedAt) <= r.ttl {
		return body, meta, nil
	}
	providerGate := c.gateFor(r.source)
	select {
	case providerGate.slot <- struct{}{}:
		defer func() { <-providerGate.slot }()
	case <-ctx.Done():
		return nil, Meta{}, ctx.Err()
	}
	// Another request may have refreshed this while we waited for the provider.
	saved, meta, haveSaved := c.readSaved(path, r)
	if haveSaved && c.now().Sub(meta.FetchedAt) <= r.ttl {
		return saved, meta, nil
	}
	var err error
	if c.now().Before(providerGate.blockedUntil) {
		err = errors.New("the provider recently failed, so Khonsu is waiting before trying again")
	} else {
		var body []byte
		var pause time.Duration
		body, pause, err = c.download(ctx, r)
		if err == nil {
			if err = r.validate(body); err != nil {
				err = fmt.Errorf("unexpected response: %w", err)
			}
		}
		if err == nil {
			if err = writeSaved(path, body); err != nil {
				return nil, Meta{}, err
			}
			return body, Meta{FetchedAt: c.now().UTC()}, nil
		}
		if ctx.Err() != nil {
			return nil, Meta{}, ctx.Err()
		}
		providerGate.blockedUntil = c.now().Add(pause)
	}
	if haveSaved {
		meta.Stale, meta.Warning = true, "Showing saved data because the provider could not be reached."
		return saved, meta, nil
	}
	return nil, Meta{}, err
}

func (c *Client) download(ctx context.Context, r request) ([]byte, time.Duration, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, r.url, nil)
	if err != nil {
		return nil, failurePause, err
	}
	req.Header.Set("User-Agent", userAgent)
	if r.accept != "" {
		req.Header.Set("Accept", r.accept)
	}
	response, err := c.http.Do(req)
	if err != nil {
		return nil, failurePause, err
	}
	defer response.Body.Close()
	if response.StatusCode != http.StatusOK {
		return nil, retryPause(response.Header.Get("Retry-After")), fmt.Errorf("provider returned HTTP %d", response.StatusCode)
	}
	body, err := io.ReadAll(io.LimitReader(response.Body, maxResponse+1))
	if err != nil {
		return nil, failurePause, err
	}
	if len(body) > maxResponse {
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

func (c *Client) readSaved(path string, r request) ([]byte, Meta, bool) {
	info, err := os.Stat(path)
	if err != nil {
		return nil, Meta{}, false
	}
	body, err := os.ReadFile(path)
	if err != nil || r.validate(body) != nil {
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
