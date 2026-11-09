package cmd

import (
	"bufio"
	"context"
	"errors"
	"fmt"
	"io"
	"os"
	"os/signal"
	"strconv"
	"strings"
	"time"

	"github.com/Mohammed-Ashour/khonsu/internal/accounts"
	"github.com/Mohammed-Ashour/khonsu/internal/orbit"
	"github.com/Mohammed-Ashour/khonsu/internal/sources/feed"
	"github.com/Mohammed-Ashour/khonsu/internal/sources/spacetrack"
	"github.com/Mohammed-Ashour/khonsu/pkg/tui"
	"github.com/urfave/cli/v3"
	"golang.org/x/term"
)

const (
	spaceTrackSignupURL = "https://www.space-track.org/auth/createAccount"
	setupAttempts       = 3
	setupCheckTimeout   = 30 * time.Second
)

func init() {
	RootCmd.Commands = append(RootCmd.Commands, &cli.Command{
		Name:        "setup",
		Usage:       "Connect optional accounts and save your location, step by step",
		Description: "Everything in setup is optional. Press Enter to skip a question.",
		Category:    "UI",
		Action: func(ctx context.Context, c *cli.Command) error {
			wizard := &setupWizard{in: bufio.NewReader(os.Stdin), out: c.Writer, verify: checkSpaceTrackLogin}
			wizard.password = wizard.readPassword
			return wizard.run(ctx)
		},
	})
}

func checkSpaceTrackLogin(ctx context.Context, user, password string) error {
	return spacetrack.NewWithAccount(feed.NewClient(""), spacetrack.DefaultBase, user, password).CheckLogin(ctx)
}

// setupWizard takes its input and login check as fields so tests can supply them.
type setupWizard struct {
	in       *bufio.Reader
	out      io.Writer
	password func(prompt string) (string, error)
	verify   func(ctx context.Context, user, password string) error
}

// ask returns a trimmed answer. A final line with no newline still counts.
func (w *setupWizard) ask(prompt string) (string, error) {
	fmt.Fprint(w.out, prompt)
	line, err := w.in.ReadString('\n')
	if err != nil && (line == "" || !errors.Is(err, io.EOF)) {
		return "", err
	}
	return strings.TrimSpace(line), nil
}

func (w *setupWizard) confirm(prompt string, preferred bool) (bool, error) {
	suffix := " [y/N] "
	if preferred {
		suffix = " [Y/n] "
	}
	answer, err := w.ask(prompt + suffix)
	if err != nil {
		return false, err
	}
	switch strings.ToLower(answer) {
	case "y", "yes":
		return true, nil
	case "n", "no":
		return false, nil
	}
	return preferred, nil
}

// readPassword hides typing at a terminal and reads a plain line from a pipe.
func (w *setupWizard) readPassword(prompt string) (string, error) {
	fd := int(os.Stdin.Fd())
	if !term.IsTerminal(fd) {
		return w.ask(prompt)
	}
	fmt.Fprint(w.out, prompt)
	state, err := term.GetState(fd)
	if err != nil {
		return "", err
	}
	// Without this, Ctrl+C here would leave the shell with typing still hidden.
	interrupted := make(chan os.Signal, 1)
	signal.Notify(interrupted, os.Interrupt)
	defer signal.Stop(interrupted)
	done := make(chan struct{})
	defer close(done)
	go func() {
		select {
		case <-interrupted:
			_ = term.Restore(fd, state)
			fmt.Fprintln(w.out)
			os.Exit(130)
		case <-done:
		}
	}()
	secret, err := term.ReadPassword(fd)
	fmt.Fprintln(w.out)
	return strings.TrimSpace(string(secret)), err
}

func (w *setupWizard) run(ctx context.Context) error {
	fmt.Fprintln(w.out, "Khonsu setup")
	fmt.Fprintln(w.out, "Everything here is optional, and Khonsu works without it.")
	err := w.spaceTrackStep(ctx)
	if err == nil {
		err = w.locationStep()
	}
	if errors.Is(err, io.EOF) {
		fmt.Fprintln(w.out, "\nSetup stopped. Anything already confirmed has been saved.")
		return nil
	}
	if err != nil {
		return err
	}
	fmt.Fprintln(w.out, "\nAll done. Run 'khonsu web' to open the app, then press Data to see every source.")
	return nil
}

func (w *setupWizard) spaceTrackStep(ctx context.Context) error {
	fmt.Fprintln(w.out, "\nStep 1 of 2: Space-Track account")
	fmt.Fprintln(w.out, "Adds authoritative catalog records to the app's Data panel. Other sources need no account.")
	if os.Getenv(spacetrack.UserEnv) != "" && os.Getenv(spacetrack.PasswordEnv) != "" {
		fmt.Fprintf(w.out, "%s and %s are set, and they take priority over a saved account.\n", spacetrack.UserEnv, spacetrack.PasswordEnv)
	}
	saved, err := accounts.Load()
	if err != nil {
		return fmt.Errorf("read saved accounts: %w", err)
	}
	prompt := "Connect an account?"
	if saved.SpaceTrack != nil {
		fmt.Fprintf(w.out, "Saved account: %s\n", saved.SpaceTrack.User)
		prompt = "Replace it?"
	}
	connect, err := w.confirm(prompt, false)
	if err != nil {
		return err
	}
	if !connect {
		if saved.SpaceTrack == nil {
			fmt.Fprintf(w.out, "Skipped. To get a free account, sign up at %s and run setup again.\n", spaceTrackSignupURL)
		}
		return nil
	}
	fmt.Fprintf(w.out, "No account yet? Sign up for free at %s\n", spaceTrackSignupURL)
	for attempt := 1; attempt <= setupAttempts; attempt++ {
		user, err := w.ask("Space-Track username: ")
		if err != nil {
			return err
		}
		if user == "" {
			fmt.Fprintln(w.out, "Skipped.")
			return nil
		}
		password, err := w.password("Password (hidden): ")
		if err != nil {
			return err
		}
		if password == "" {
			fmt.Fprintln(w.out, "Skipped.")
			return nil
		}
		fmt.Fprintln(w.out, "Checking with Space-Track...")
		check, cancel := context.WithTimeout(ctx, setupCheckTimeout)
		err = w.verify(check, user, password)
		cancel()
		retry := false
		switch {
		case err == nil:
			fmt.Fprintln(w.out, "Space-Track accepted the account.")
		case errors.Is(err, feed.ErrCredentialsRejected):
			fmt.Fprintln(w.out, "Space-Track did not accept that username and password.")
			if attempt == setupAttempts {
				fmt.Fprintln(w.out, "Stopping here so repeated attempts don't lock the account. Nothing was saved.")
				return nil
			}
			if retry, err = w.confirm("Try again?", true); err != nil {
				return err
			}
			if !retry {
				return nil
			}
			continue
		default:
			fmt.Fprintf(w.out, "Could not check the account: %v\n", err)
			keep, err := w.confirm("Save it anyway?", false)
			if err != nil {
				return err
			}
			if !keep {
				fmt.Fprintln(w.out, "Nothing was saved.")
				return nil
			}
		}
		saved.SpaceTrack = &accounts.SpaceTrack{User: user, Password: password}
		if err := accounts.Save(saved); err != nil {
			return fmt.Errorf("save account: %w", err)
		}
		path, _ := accounts.Path()
		fmt.Fprintf(w.out, "Saved to %s. The file is not encrypted, and only your user can read it.\n", path)
		return nil
	}
	return nil
}

func (w *setupWizard) number(prompt string) (float64, bool, error) {
	answer, err := w.ask(prompt)
	if err != nil || answer == "" {
		return 0, false, err
	}
	value, err := strconv.ParseFloat(answer, 64)
	if err != nil {
		return 0, true, fmt.Errorf("%q is not a number", answer)
	}
	return value, true, nil
}

func (w *setupWizard) locationStep() error {
	fmt.Fprintln(w.out, "\nStep 2 of 2: Your location")
	fmt.Fprintln(w.out, "Used by 'khonsu tonight' and the terminal UI, and kept on this computer. The web app asks separately.")
	settings, err := tui.LoadSettings()
	if err != nil {
		fmt.Fprintf(w.out, "Skipped, because your current settings could not be read: %v\n", err)
		return nil
	}
	prompt := "Set your location?"
	if settings.Observer.Lat != 0 || settings.Observer.Lon != 0 {
		fmt.Fprintf(w.out, "Saved location: %.4f, %.4f\n", settings.Observer.Lat, settings.Observer.Lon)
		prompt = "Change it?"
	}
	change, err := w.confirm(prompt, false)
	if err != nil || !change {
		return err
	}
	for attempt := 1; attempt <= setupAttempts; attempt++ {
		observer, skipped, err := w.readObserver()
		if err != nil && errors.Is(err, io.EOF) {
			return err
		}
		if skipped {
			fmt.Fprintln(w.out, "Skipped.")
			return nil
		}
		if err == nil {
			err = observer.Validate()
		}
		if err != nil {
			fmt.Fprintf(w.out, "%v\n", err)
			continue
		}
		settings.Observer = observer
		if err := tui.SaveSettings(settings); err != nil {
			return fmt.Errorf("save location: %w", err)
		}
		fmt.Fprintln(w.out, "Location saved.")
		return nil
	}
	fmt.Fprintln(w.out, "Skipped after too many invalid answers.")
	return nil
}

func (w *setupWizard) readObserver() (orbit.Observer, bool, error) {
	lat, given, err := w.number("Latitude, -90 to 90: ")
	if err != nil || !given {
		return orbit.Observer{}, !given && err == nil, err
	}
	lon, given, err := w.number("Longitude, -180 to 180: ")
	if err != nil || !given {
		return orbit.Observer{}, !given && err == nil, err
	}
	alt, _, err := w.number("Altitude in km [0]: ")
	if err != nil {
		return orbit.Observer{}, false, err
	}
	return orbit.Observer{Lat: lat, Lon: lon, Alt: alt}, false, nil
}
