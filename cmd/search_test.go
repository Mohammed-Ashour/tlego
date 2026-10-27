package cmd

import (
	"bytes"
	"context"
	"errors"
	"io"
	"net/http"
	"os"
	"strings"
	"testing"
	"time"

	"github.com/urfave/cli/v3"
)

func TestSearchDeadlineShowsPartialResultsAndCancellationRemainsError(t *testing.T) {
	payload, err := os.ReadFile("../internal/elements/testdata/25544.json")
	if err != nil {
		t.Fatal(err)
	}
	originalTransport := http.DefaultTransport
	t.Cleanup(func() { http.DefaultTransport = originalTransport })
	for _, deadline := range []bool{true, false} {
		name := "cancellation"
		if deadline {
			name = "deadline"
		}
		t.Run(name, func(t *testing.T) {
			var ctx context.Context
			var cancel context.CancelFunc
			if deadline {
				ctx, cancel = context.WithTimeout(context.Background(), time.Second)
			} else {
				ctx, cancel = context.WithCancel(context.Background())
			}
			defer cancel()
			calls := 0
			http.DefaultTransport = fixtureTransport(func(r *http.Request) (*http.Response, error) {
				calls++
				if calls == 1 {
					return &http.Response{StatusCode: http.StatusOK, Body: io.NopCloser(bytes.NewReader(payload)), Header: make(http.Header)}, nil
				}
				if !deadline {
					cancel()
				}
				<-r.Context().Done()
				return nil, r.Context().Err()
			})
			var stdout, stderr bytes.Buffer
			command := &cli.Command{Name: "search", Flags: cacheFlags(), Action: searchSatellites, Writer: &stdout, ErrWriter: &stderr}
			err := command.Run(ctx, []string{"search", "--cache-dir", t.TempDir(), "25544"})
			if !deadline {
				if !errors.Is(err, context.Canceled) || stdout.Len() != 0 {
					t.Fatalf("cancellation: output=%q error=%v", stdout.String(), err)
				}
				return
			}
			if err != nil || !strings.Contains(stdout.String(), "NORAD ID: 25544") || !strings.Contains(stderr.String(), "Search coverage: 1/") || !strings.Contains(stderr.String(), "results are partial") {
				t.Fatalf("partial search: stdout=%q stderr=%q error=%v", stdout.String(), stderr.String(), err)
			}
		})
	}
}
