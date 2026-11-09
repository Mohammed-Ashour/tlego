package spacetrack

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync/atomic"
	"testing"

	"github.com/Mohammed-Ashour/khonsu/internal/accounts"
	"github.com/Mohammed-Ashour/khonsu/internal/sources/feed"
)

func TestRecordsLogsInOnceAndUsesTheSession(t *testing.T) {
	var logins atomic.Int32
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/ajaxauth/login" {
			logins.Add(1)
			if r.PostFormValue("identity") != "me" || r.PostFormValue("password") != "secret" {
				t.Errorf("login form = %v", r.PostForm)
			}
			http.SetCookie(w, &http.Cookie{Name: "chocolatechip", Value: "session", Path: "/"})
			w.Write([]byte(`""`))
			return
		}
		if cookie, err := r.Cookie("chocolatechip"); err != nil || cookie.Value != "session" {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}
		w.Write([]byte(`[{"OBJECT_NAME":"ISS (ZARYA)","OBJECT_TYPE":"PAYLOAD","RCS_SIZE":"LARGE","COUNTRY_CODE":"ISS","LAUNCH_DATE":"1998-11-20","DECAY_DATE":null,"EPOCH":"2026-11-09T12:00:00"}]`))
	}))
	defer server.Close()
	c := NewWithAccount(feed.NewClient(t.TempDir()), server.URL, "me", "secret")
	for _, id := range []string{"25544", "20580"} {
		records, _, err := c.Records(context.Background(), id)
		if err != nil {
			t.Fatal(err)
		}
		if len(records) != 1 || records[0].RCSSize != "LARGE" || records[0].DecayDate != "" {
			t.Fatalf("records = %+v", records)
		}
	}
	if logins.Load() != 1 {
		t.Fatalf("logged in %d times, want 1", logins.Load())
	}
}

func TestRejectedAccountNamesNoSecret(t *testing.T) {
	for _, tc := range []struct {
		name   string
		status int
		body   string
	}{
		{"failed body", http.StatusOK, `{"Login":"Failed"}`},
		{"HTTP status", http.StatusUnauthorized, ""},
	} {
		t.Run(tc.name, func(t *testing.T) {
			server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				w.WriteHeader(tc.status)
				w.Write([]byte(tc.body))
			}))
			defer server.Close()
			_, _, err := NewWithAccount(feed.NewClient(t.TempDir()), server.URL, "me", "hunter2").Records(context.Background(), "25544")
			if !errors.Is(err, feed.ErrCredentialsRejected) {
				t.Fatalf("err = %v, want a rejected account", err)
			}
			if strings.Contains(err.Error(), "hunter2") {
				t.Fatalf("err = %v names a secret", err)
			}
		})
	}
}

func TestUnreachableSpaceTrackIsNotARejectedAccount(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {}))
	url := server.URL
	server.Close()
	_, _, err := NewWithAccount(feed.NewClient(t.TempDir()), url, "me", "hunter2").Records(context.Background(), "25544")
	if err == nil || errors.Is(err, feed.ErrCredentialsRejected) || strings.Contains(err.Error(), "hunter2") {
		t.Fatalf("err = %v, want a network error that is not a rejection", err)
	}
}

func TestRecordsNeedsAnAccount(t *testing.T) {
	t.Setenv(UserEnv, "")
	t.Setenv(PasswordEnv, "")
	t.Setenv("XDG_CONFIG_HOME", t.TempDir())
	c := New(feed.NewClient(t.TempDir()))
	if _, _, err := c.Records(context.Background(), "25544"); !errors.Is(err, ErrNoAccount) || c.Configured() {
		t.Fatalf("err = %v, configured = %v", err, c.Configured())
	}
}

func TestServerOutageIsNotARejectedAccount(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { w.WriteHeader(http.StatusServiceUnavailable) }))
	defer server.Close()
	_, _, err := NewWithAccount(feed.NewClient(t.TempDir()), server.URL, "me", "secret").Records(context.Background(), "25544")
	if err == nil || errors.Is(err, feed.ErrCredentialsRejected) {
		t.Fatalf("err = %v, want a failure that is not a rejected account", err)
	}
}

func TestNewUsesSavedAccountUnlessTheEnvironmentHasOne(t *testing.T) {
	t.Setenv("XDG_CONFIG_HOME", t.TempDir())
	t.Setenv(UserEnv, "")
	t.Setenv(PasswordEnv, "")
	if err := accounts.Save(accounts.Accounts{SpaceTrack: &accounts.SpaceTrack{User: "saved", Password: "file"}}); err != nil {
		t.Fatal(err)
	}
	if c := New(feed.NewClient(t.TempDir())); !c.Configured() || c.login.user != "saved" {
		t.Fatalf("login = %+v", c.login)
	}
	t.Setenv(UserEnv, "env")
	t.Setenv(PasswordEnv, "value")
	if c := New(feed.NewClient(t.TempDir())); c.login.user != "env" {
		t.Fatalf("login = %+v, want the environment's account", c.login)
	}
}

func TestCheckLoginIgnoresAnEarlierSession(t *testing.T) {
	var logins atomic.Int32
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		logins.Add(1)
		w.Write([]byte(`""`))
	}))
	defer server.Close()
	c := NewWithAccount(feed.NewClient(t.TempDir()), server.URL, "me", "secret")
	for range 2 {
		if err := c.CheckLogin(context.Background()); err != nil {
			t.Fatal(err)
		}
	}
	if logins.Load() != 2 {
		t.Fatalf("logged in %d times, want 2", logins.Load())
	}
}
