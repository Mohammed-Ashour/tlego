package cmd

import (
	"bufio"
	"bytes"
	"context"
	"errors"
	"strings"
	"testing"

	"github.com/Mohammed-Ashour/khonsu/internal/accounts"
	"github.com/Mohammed-Ashour/khonsu/internal/sources/feed"
	"github.com/Mohammed-Ashour/khonsu/internal/sources/spacetrack"
	"github.com/Mohammed-Ashour/khonsu/pkg/tui"
)

func runWizard(t *testing.T, input string, verify func(string) error) string {
	t.Helper()
	t.Setenv(spacetrack.UserEnv, "")
	t.Setenv(spacetrack.PasswordEnv, "")
	var out bytes.Buffer
	wizard := &setupWizard{in: bufio.NewReader(strings.NewReader(input)), out: &out, verify: func(_ context.Context, _, password string) error { return verify(password) }}
	wizard.password = wizard.ask
	if err := wizard.run(context.Background()); err != nil {
		t.Fatal(err)
	}
	return out.String()
}

func accepted(string) error { return nil }

func TestSetupSavesAnAcceptedAccountAndLocation(t *testing.T) {
	t.Setenv("XDG_CONFIG_HOME", t.TempDir())
	out := runWizard(t, "y\nme\nsecret\ny\n51.48\n-0.12\n\n", accepted)
	saved, err := accounts.Load()
	if err != nil || saved.SpaceTrack == nil || saved.SpaceTrack.User != "me" || saved.SpaceTrack.Password != "secret" {
		t.Fatalf("saved = %+v, %v", saved, err)
	}
	settings, err := tui.LoadSettings()
	if err != nil || settings.Observer.Lat != 51.48 || settings.Observer.Lon != -0.12 {
		t.Fatalf("settings = %+v, %v", settings.Observer, err)
	}
	if strings.Contains(out, "secret") {
		t.Fatalf("output shows the password:\n%s", out)
	}
}

func TestSetupSkippingEverythingSavesNothing(t *testing.T) {
	t.Setenv("XDG_CONFIG_HOME", t.TempDir())
	out := runWizard(t, "\n\n", accepted)
	if saved, _ := accounts.Load(); saved.SpaceTrack != nil {
		t.Fatalf("saved = %+v", saved)
	}
	if !strings.Contains(out, spaceTrackSignupURL) || !strings.Contains(out, "All done") {
		t.Fatalf("out:\n%s", out)
	}
}

func TestSetupRetriesARejectedPasswordAndStopsBeforeLockout(t *testing.T) {
	t.Setenv("XDG_CONFIG_HOME", t.TempDir())
	calls := 0
	reject := func(password string) error {
		calls++
		if password == "right" {
			return nil
		}
		return feed.ErrCredentialsRejected
	}
	runWizard(t, "y\nme\nwrong\ny\nme\nright\n\n", reject)
	if saved, _ := accounts.Load(); saved.SpaceTrack == nil || saved.SpaceTrack.Password != "right" || calls != 2 {
		t.Fatalf("saved = %+v, calls = %d", saved.SpaceTrack, calls)
	}

	t.Setenv("XDG_CONFIG_HOME", t.TempDir())
	calls = 0
	out := runWizard(t, "y\nme\na\ny\nme\nb\ny\nme\nc\n\n", func(string) error {
		calls++
		return feed.ErrCredentialsRejected
	})
	if saved, _ := accounts.Load(); saved.SpaceTrack != nil || calls != setupAttempts || !strings.Contains(out, "lock the account") {
		t.Fatalf("saved = %+v, calls = %d, out:\n%s", saved.SpaceTrack, calls, out)
	}
}

func TestSetupOnlySavesAnUncheckedAccountWhenAsked(t *testing.T) {
	offline := func(string) error { return errors.New("no route to host") }
	t.Setenv("XDG_CONFIG_HOME", t.TempDir())
	runWizard(t, "y\nme\nsecret\n\n\n", offline)
	if saved, _ := accounts.Load(); saved.SpaceTrack != nil {
		t.Fatalf("saved without asking: %+v", saved.SpaceTrack)
	}
	t.Setenv("XDG_CONFIG_HOME", t.TempDir())
	runWizard(t, "y\nme\nsecret\ny\n\n", offline)
	if saved, _ := accounts.Load(); saved.SpaceTrack == nil {
		t.Fatal("account was not saved")
	}
}

func TestSetupRepromptsForAnInvalidLocation(t *testing.T) {
	t.Setenv("XDG_CONFIG_HOME", t.TempDir())
	runWizard(t, "n\ny\n95\n0\n\nabc\n10\n20\n0\n", accepted)
	settings, err := tui.LoadSettings()
	if err != nil || settings.Observer.Lat != 10 || settings.Observer.Lon != 20 {
		t.Fatalf("settings = %+v, %v", settings.Observer, err)
	}
}

func TestSetupStopsCleanlyWhenInputEnds(t *testing.T) {
	t.Setenv("XDG_CONFIG_HOME", t.TempDir())
	if out := runWizard(t, "y\nme", accepted); !strings.Contains(out, "Setup stopped") {
		t.Fatalf("out:\n%s", out)
	}
}
