// Package extensions implements tlego's executable command extensions.
package extensions

import (
	"context"
	"errors"
	"fmt"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"sort"
	"strings"

	"golang.org/x/term"
)

const Version = "1"

// Command is one executable extension found on PATH.
type Command struct {
	Name       string
	Executable string
	Candidates []string
}

// ValidName reports whether name is an ASCII command extension name.
func ValidName(name string) bool {
	if name == "" || !letter(name[0]) {
		return false
	}
	for i := 1; i < len(name); i++ {
		c := name[i]
		if !letter(c) && !(c >= '0' && c <= '9') && c != '-' {
			return false
		}
	}
	return true
}

func letter(c byte) bool { return c >= 'A' && c <= 'Z' || c >= 'a' && c <= 'z' }

// InteractiveInput reports whether input is a terminal, which determines
// whether an extension must share the caller's foreground process group.
func InteractiveInput(input io.Reader) bool {
	file, ok := input.(*os.File)
	return ok && term.IsTerminal(int(file.Fd()))
}

// Find returns the first executable tlego-name found on PATH. It deliberately
// never searches the current directory unless that directory is explicitly on PATH.
func Find(name string) (string, error) {
	if !ValidName(name) {
		return "", exec.ErrNotFound
	}
	command := "tlego-" + name
	for _, dir := range filepath.SplitList(os.Getenv("PATH")) {
		// Empty PATH entries mean the current directory in some OSes; skip them
		// so an unconfigured local executable cannot become an extension.
		if dir == "" {
			continue
		}
		path, err := exec.LookPath(filepath.Join(dir, command))
		if err != nil {
			if errors.Is(err, exec.ErrDot) {
				return "", err
			}
			continue
		}
		if !filepath.IsAbs(path) {
			return "", &exec.Error{Name: command, Err: exec.ErrDot}
		}
		if runtime.GOOS == "windows" {
			switch strings.ToLower(filepath.Ext(path)) {
			case ".bat", ".cmd":
				return "", fmt.Errorf("batch extensions are not supported; extensions are launched without a shell")
			}
		}
		return filepath.Abs(path)
	}
	return "", exec.ErrNotFound
}

// Discover lists every executable extension candidate on PATH, retaining the
// first PATH match for each name. Results are sorted by extension name.
func Discover() []Command {
	seen := make(map[string]struct{})
	all := make(map[string][]string)
	for _, dir := range filepath.SplitList(os.Getenv("PATH")) {
		if dir == "" {
			continue
		}
		entries, err := os.ReadDir(dir)
		if err != nil {
			continue
		}
		for _, e := range entries {
			base := e.Name()
			if runtime.GOOS == "windows" {
				if len(base) < len("tlego-") || !strings.EqualFold(base[:len("tlego-")], "tlego-") {
					continue
				}
			} else if !strings.HasPrefix(base, "tlego-") {
				continue
			}
			name := base[len("tlego-"):]
			if runtime.GOOS == "windows" {
				name = strings.ToLower(name)
			}
			if runtime.GOOS == "windows" {
				ext := strings.ToLower(filepath.Ext(name))
				if ext == ".exe" || ext == ".com" {
					name = strings.TrimSuffix(name, filepath.Ext(name))
				}
			}
			if !ValidName(name) {
				continue
			}
			p := filepath.Join(dir, base)
			if executable(p, e) {
				abs, err := filepath.Abs(p)
				if err == nil {
					all[name] = append(all[name], abs)
					seen[name] = struct{}{}
				}
			}
		}
	}
	names := make([]string, 0, len(seen))
	for n := range seen {
		names = append(names, n)
	}
	sort.Strings(names)
	out := make([]Command, 0, len(names))
	for _, n := range names {
		selected, err := Find(n)
		if err != nil {
			continue
		}
		out = append(out, Command{Name: n, Executable: selected, Candidates: append([]string(nil), all[n]...)})
	}
	return out
}

func executable(path string, entry os.DirEntry) bool {
	info, err := entry.Info()
	if err != nil || info.IsDir() {
		return false
	}
	if runtime.GOOS == "windows" {
		switch strings.ToLower(filepath.Ext(path)) {
		case ".exe", ".com":
			return true
		}
		return false
	}
	if info.Mode()&0111 != 0 {
		return true
	}
	return false
}

// ExitError marks a child process failure so main can preserve the child's status.
type ExitError struct {
	Code     int
	Err      error
	Suppress bool
}

func (e *ExitError) Error() string  { return e.Err.Error() }
func (e *ExitError) Unwrap() error  { return e.Err }
func (e *ExitError) Reported() bool { return e.Suppress }

// Run executes the matching extension with argv preserved after argv[0].
func Run(ctx context.Context, argv []string, hostVersion string, stdin io.Reader, stdout, stderr io.Writer) error {
	if len(argv) == 0 {
		return fmt.Errorf("missing extension command")
	}
	path, err := Find(argv[0])
	if err != nil {
		if errors.Is(err, exec.ErrNotFound) || errors.Is(err, os.ErrNotExist) {
			return &ExitError{Code: 127, Err: fmt.Errorf("tlego: extension %q not found on PATH", argv[0])}
		}
		return &ExitError{Code: 126, Err: fmt.Errorf("tlego: cannot locate extension %q: %w", argv[0], err)}
	}
	cmd := exec.Command(path, argv[1:]...)
	interactive := InteractiveInput(stdin)
	configureCommand(cmd, interactive)
	cmd.Stdin, cmd.Stdout, cmd.Stderr = stdin, stdout, stderr
	cmd.Env = append(os.Environ(), "TLEGO_HOST_VERSION="+hostVersion, "TLEGO_EXTENSION_VERSION="+Version)
	err = runCommand(ctx, cmd, interactive)
	if err == nil {
		return nil
	}
	if ctx.Err() != nil {
		return &ExitError{Code: 130, Err: err, Suppress: true}
	}
	var ee *exec.ExitError
	if errors.As(err, &ee) {
		code := exitStatus(ee)
		if ctx.Err() != nil {
			code = 130
		}
		return &ExitError{Code: code, Err: err, Suppress: true}
	}
	return &ExitError{Code: 126, Err: fmt.Errorf("tlego: cannot run extension %q: %w", argv[0], err)}
}
