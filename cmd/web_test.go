package cmd

import (
	"bytes"
	"context"
	"io"
	"net/http"
	"regexp"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/urfave/cli/v3"
)

type lockedBuffer struct {
	mu sync.Mutex
	b  bytes.Buffer
}

func (l *lockedBuffer) Write(p []byte) (int, error) {
	l.mu.Lock()
	defer l.mu.Unlock()
	return l.b.Write(p)
}

func (l *lockedBuffer) String() string {
	l.mu.Lock()
	defer l.mu.Unlock()
	return l.b.String()
}

func TestWebServesEmbeddedAppAndOpensBrowser(t *testing.T) {
	opened := make(chan string, 1)
	original := openBrowser
	openBrowser = func(url string) error { opened <- url; return nil }
	t.Cleanup(func() { openBrowser = original })

	var stdout, stderr lockedBuffer
	command := newWebCommand()
	command.Writer, command.ErrWriter = &stdout, &stderr
	command.ExitErrHandler = func(context.Context, *cli.Command, error) {}
	ctx, cancel := context.WithCancel(context.Background())
	done := make(chan error, 1)
	go func() {
		done <- command.Run(ctx, []string{"web", "--addr", "127.0.0.1:0", "--file", "../examples/tui-demo/iss.tle"})
	}()
	var url string
	select {
	case url = <-opened:
	case err := <-done:
		t.Fatalf("server stopped early: %v", err)
	case <-time.After(10 * time.Second):
		t.Fatal("browser was not opened")
	}
	if !regexp.MustCompile(`http://127\.0\.0\.1:\d+`).MatchString(stdout.String()) {
		t.Fatalf("stdout = %q", stdout.String())
	}
	get := func(path string) (int, string, http.Header) {
		t.Helper()
		response, err := http.Get(url + path)
		if err != nil {
			t.Fatal(err)
		}
		defer response.Body.Close()
		body, err := io.ReadAll(response.Body)
		if err != nil {
			t.Fatal(err)
		}
		return response.StatusCode, string(body), response.Header
	}
	status, body, headers := get("/")
	if status != http.StatusOK || !strings.Contains(body, "app.js") {
		t.Fatalf("index: %d %q", status, body)
	}
	if !strings.Contains(headers.Get("Content-Security-Policy"), "default-src 'self'") {
		t.Fatalf("headers = %v", headers)
	}
	if status, _, _ := get("/app.js"); status != http.StatusOK {
		t.Fatalf("app.js status = %d", status)
	}
	status, body, _ = get("/api/v1/position?norad_id=25544&time=2026-10-24T05:01:11Z")
	if status != http.StatusOK || !strings.Contains(body, `"source": "file"`) {
		t.Fatalf("position: %d %s", status, body)
	}
	cancel()
	select {
	case err := <-done:
		if err != nil {
			t.Fatalf("shutdown error: %v", err)
		}
	case <-time.After(10 * time.Second):
		t.Fatal("server did not stop")
	}
}

func TestWebRejectsUnreadableFile(t *testing.T) {
	command := newWebCommand()
	var stdout, stderr lockedBuffer
	command.Writer, command.ErrWriter = &stdout, &stderr
	command.ExitErrHandler = func(context.Context, *cli.Command, error) {}
	if err := command.Run(context.Background(), []string{"web", "--no-open", "--file", "missing.tle"}); err == nil {
		t.Fatal("accepted a missing file")
	}
}

func TestWebWarnsWhenReachableFromOtherMachines(t *testing.T) {
	opened := make(chan string, 1)
	original := openBrowser
	openBrowser = func(url string) error { opened <- url; return nil }
	t.Cleanup(func() { openBrowser = original })
	var stdout, stderr lockedBuffer
	command := newWebCommand()
	command.Writer, command.ErrWriter = &stdout, &stderr
	command.ExitErrHandler = func(context.Context, *cli.Command, error) {}
	ctx, cancel := context.WithCancel(context.Background())
	done := make(chan error, 1)
	go func() {
		done <- command.Run(ctx, []string{"web", "--addr", "0.0.0.0:0", "--file", "../examples/tui-demo/iss.tle"})
	}()
	select {
	case url := <-opened:
		if !strings.HasPrefix(url, "http://127.0.0.1:") {
			t.Fatalf("opened %q", url)
		}
	case err := <-done:
		t.Fatalf("server stopped early: %v", err)
	case <-time.After(10 * time.Second):
		t.Fatal("browser was not opened")
	}
	cancel()
	<-done
	if !strings.Contains(stderr.String(), "reachable from other machines") {
		t.Fatalf("stderr = %q", stderr.String())
	}
}

func TestIsLoopback(t *testing.T) {
	for addr, want := range map[string]bool{"127.0.0.1:8080": true, "localhost:80": true, "[::1]:80": true, ":8080": false, "0.0.0.0:80": false, "192.168.1.5:80": false, "nonsense": false} {
		if got := isLoopback(addr); got != want {
			t.Errorf("isLoopback(%q) = %t", addr, got)
		}
	}
}
