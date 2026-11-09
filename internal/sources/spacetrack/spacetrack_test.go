package spacetrack

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync/atomic"
	"testing"

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
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { w.Write([]byte(`{"Login":"Failed"}`)) }))
	defer server.Close()
	_, _, err := NewWithAccount(feed.NewClient(t.TempDir()), server.URL, "me", "hunter2").Records(context.Background(), "25544")
	if err == nil || strings.Contains(err.Error(), "hunter2") {
		t.Fatalf("err = %v", err)
	}
}

func TestRecordsNeedsAnAccount(t *testing.T) {
	t.Setenv(UserEnv, "")
	t.Setenv(PasswordEnv, "")
	c := New(feed.NewClient(t.TempDir()))
	if _, _, err := c.Records(context.Background(), "25544"); !errors.Is(err, ErrNoAccount) || c.Configured() {
		t.Fatalf("err = %v, configured = %v", err, c.Configured())
	}
}
