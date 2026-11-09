// Package spacetrack reads catalog records from Space-Track.org with the user's own account.
package spacetrack

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/http/cookiejar"
	"net/url"
	"os"
	"strings"
	"time"

	"github.com/Mohammed-Ashour/khonsu/internal/sources/feed"
)

// ID identifies this source.
const ID = "space-track"

// Environment variables holding the user's own account.
const (
	UserEnv     = "KHONSU_SPACE_TRACK_USER"
	PasswordEnv = "KHONSU_SPACE_TRACK_PASSWORD"
)

const (
	recordTTL   = time.Hour
	sessionLife = time.Hour
)

// Info describes and credits this source.
var Info = feed.Info{
	ID:       ID,
	Name:     "Space-Track",
	Category: feed.CategoryOrbits,
	URL:      "https://www.space-track.org/documentation",
	Credit:   "Orbital data from Space-Track.org",
	Summary:  "Authoritative catalog record, using your own account.",
	Nature:   feed.NatureEstimated,
	Refresh:  "When a satellite is opened, at most hourly",
	Status:   feed.StatusSetup,
}

// DefaultBase is the provider's address.
const DefaultBase = "https://www.space-track.org"

// Client reads this provider through a shared feed client.
type Client struct {
	feed  *feed.Client
	base  string
	login *account
}

// New uses the account named by the environment, if there is one.
func New(f *feed.Client) *Client { return &Client{f, DefaultBase, accountFromEnv()} }

// NewWithAccount uses an explicit account and address, such as a test server.
func NewWithAccount(f *feed.Client, base, user, password string) *Client {
	return &Client{f, base, newAccount(user, password)}
}

// Configured reports whether the user has supplied an account.
func (c *Client) Configured() bool { return c.login != nil }

// account holds a session. It is only used while the provider slot is held.
type account struct {
	user, password string
	http           *http.Client
	loggedIn       time.Time
}

func accountFromEnv() *account {
	user, password := os.Getenv(UserEnv), os.Getenv(PasswordEnv)
	if user == "" || password == "" {
		return nil
	}
	return newAccount(user, password)
}

func newAccount(user, password string) *account {
	jar, _ := cookiejar.New(nil) // New never fails without options.
	return &account{user: user, password: password, http: &http.Client{Jar: jar}}
}

func (c *Client) logIn(ctx context.Context) error {
	account := c.login
	if !account.loggedIn.IsZero() && c.feed.Now().Sub(account.loggedIn) < sessionLife {
		return nil
	}
	form := url.Values{"identity": {account.user}, "password": {account.password}}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, c.base+"/ajaxauth/login", strings.NewReader(form.Encode()))
	if err != nil {
		return errors.New("could not start the Space-Track login")
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.Header.Set("User-Agent", feed.UserAgent)
	response, err := account.http.Do(req)
	if err != nil {
		return errors.New("could not reach Space-Track to log in")
	}
	defer response.Body.Close()
	var buffer bytes.Buffer
	_, _ = buffer.ReadFrom(response.Body)
	// An outage must not count as a bad account, which pauses the source for hours.
	if response.StatusCode != http.StatusOK && response.StatusCode != http.StatusUnauthorized && response.StatusCode != http.StatusForbidden {
		return fmt.Errorf("Space-Track login returned HTTP %d", response.StatusCode)
	}
	if response.StatusCode != http.StatusOK || strings.Contains(buffer.String(), "Failed") {
		return fmt.Errorf("Space-Track did not accept the account: %w", feed.ErrCredentialsRejected)
	}
	account.loggedIn = c.feed.Now()
	return nil
}

// Record is the catalog part of a Space-Track GP record.
type Record struct {
	Name       string `json:"name"`
	ObjectType string `json:"object_type"`
	RCSSize    string `json:"rcs_size,omitempty"`
	Country    string `json:"country,omitempty"`
	LaunchDate string `json:"launch_date,omitempty"`
	DecayDate  string `json:"decay_date,omitempty"`
	Epoch      string `json:"epoch"`
}

func parse(body []byte) ([]Record, error) {
	var rows []struct {
		Name    string  `json:"OBJECT_NAME"`
		Type    string  `json:"OBJECT_TYPE"`
		RCS     *string `json:"RCS_SIZE"`
		Country *string `json:"COUNTRY_CODE"`
		Launch  *string `json:"LAUNCH_DATE"`
		Decay   *string `json:"DECAY_DATE"`
		Epoch   string  `json:"EPOCH"`
	}
	if err := json.Unmarshal(body, &rows); err != nil {
		return nil, err
	}
	if rows == nil {
		return nil, errors.New("no record list")
	}
	text := func(value *string) string {
		if value == nil {
			return ""
		}
		return *value
	}
	records := make([]Record, 0, len(rows))
	for _, row := range rows {
		records = append(records, Record{row.Name, row.Type, text(row.RCS), text(row.Country), text(row.Launch), text(row.Decay), row.Epoch})
	}
	return records, nil
}

// ErrNoAccount means the user hasn't supplied an account.
var ErrNoAccount = fmt.Errorf("connect a Space-Track account by setting %s and %s", UserEnv, PasswordEnv)

// Records returns a satellite's record using the user's own account.
func (c *Client) Records(ctx context.Context, noradID string) ([]Record, feed.Meta, error) {
	if c.login == nil {
		return nil, feed.Meta{}, ErrNoAccount
	}
	id, err := feed.CanonicalID(noradID)
	if err != nil {
		return nil, feed.Meta{}, err
	}
	address := fmt.Sprintf("%s/basicspacedata/query/class/gp/NORAD_CAT_ID/%s/format/json", c.base, id)
	return feed.Get(ctx, c.feed, feed.Request{Source: ID, Key: id, URL: address, TTL: recordTTL, HTTP: c.login.http, Prepare: c.logIn}, parse)
}
