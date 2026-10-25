package extensions

import (
	"bytes"
	"context"
	"errors"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
	"testing"
	"time"
)

func makeExec(t *testing.T, dir, name, body string) string {
	t.Helper()
	if runtime.GOOS == "windows" {
		t.Skip("shell executable fixture is Unix-specific")
	}
	p := filepath.Join(dir, name)
	if err := os.WriteFile(p, []byte("#!/bin/sh\n"+body), 0755); err != nil {
		t.Fatal(err)
	}
	return p
}

func TestRunPreservesArgumentsStreamsAndEnvironment(t *testing.T) {
	dir := t.TempDir()
	makeExec(t, dir, "tlego-capture", `printf '%s\n' "$@"; printf 'host=%s ext=%s\n' "$TLEGO_HOST_VERSION" "$TLEGO_EXTENSION_VERSION"; read value; printf 'out:%s\n' "$value"; printf 'err:%s\n' "$value" >&2`)
	t.Setenv("PATH", dir)
	var out, stderr bytes.Buffer
	err := Run(context.Background(), []string{"capture", "a b", "", "'quote'", "--x"}, "v9", strings.NewReader("input\n"), &out, &stderr)
	if err != nil {
		t.Fatal(err)
	}
	want := "a b\n\n'quote'\n--x\nhost=v9 ext=1\nout:input\n"
	if out.String() != want {
		t.Fatalf("stdout = %q, want %q", out.String(), want)
	}
	if stderr.String() != "err:input\n" {
		t.Fatalf("stderr = %q", stderr.String())
	}
}

func TestRunPreservesChildExitStatus(t *testing.T) {
	dir := t.TempDir()
	makeExec(t, dir, "tlego-fail", "exit 23")
	t.Setenv("PATH", dir)
	err := Run(context.Background(), []string{"fail"}, "v", strings.NewReader(""), &bytes.Buffer{}, &bytes.Buffer{})
	var exitErr *ExitError
	if !errors.As(err, &exitErr) || exitErr.Code != 23 || !exitErr.Reported() {
		t.Fatalf("error = %#v", err)
	}
}

func TestRunMapsSignalExitToShellStatus(t *testing.T) {
	dir := t.TempDir()
	makeExec(t, dir, "tlego-interrupted", "kill -INT $$")
	t.Setenv("PATH", dir)
	err := Run(context.Background(), []string{"interrupted"}, "v", strings.NewReader(""), &bytes.Buffer{}, &bytes.Buffer{})
	var exitErr *ExitError
	if !errors.As(err, &exitErr) || exitErr.Code != 130 {
		t.Fatalf("signal exit = %#v, want status 130", err)
	}
}

func TestRunCancellationStopsExtensionTree(t *testing.T) {
	dir := t.TempDir()
	sleep, err := exec.LookPath("sleep")
	if err != nil {
		t.Fatal(err)
	}
	t.Setenv("TLEGO_TEST_SLEEP", sleep)
	makeExec(t, dir, "tlego-wait", `"$TLEGO_TEST_SLEEP" 30 & wait`)
	t.Setenv("PATH", dir)
	ctx, cancel := context.WithCancel(context.Background())
	done := make(chan error, 1)
	go func() {
		done <- Run(ctx, []string{"wait"}, "v", strings.NewReader(""), &bytes.Buffer{}, &bytes.Buffer{})
	}()
	time.Sleep(100 * time.Millisecond)
	cancel()
	select {
	case err := <-done:
		var exitErr *ExitError
		if !errors.As(err, &exitErr) || exitErr.Code != 130 {
			t.Fatalf("cancel error = %#v", err)
		}
	case <-time.After(3 * time.Second):
		t.Fatal("extension process tree did not stop after cancellation")
	}
}

func TestRunMissingAndUnlaunchable(t *testing.T) {
	t.Setenv("PATH", t.TempDir())
	err := Run(context.Background(), []string{"missing"}, "v", strings.NewReader(""), &bytes.Buffer{}, &bytes.Buffer{})
	var exitErr *ExitError
	if !errors.As(err, &exitErr) || exitErr.Code != 127 {
		t.Fatalf("missing error = %#v", err)
	}
	dir := t.TempDir()
	if err := os.WriteFile(filepath.Join(dir, "tlego-bad"), []byte("not executable"), 0644); err != nil {
		t.Fatal(err)
	}
	t.Setenv("PATH", dir)
	err = Run(context.Background(), []string{"bad"}, "v", strings.NewReader(""), &bytes.Buffer{}, &bytes.Buffer{})
	if !errors.As(err, &exitErr) || exitErr.Code != 127 {
		t.Fatalf("non-executable error = %#v", err)
	}
	if runtime.GOOS == "windows" {
		// Windows discovers native executable suffixes, not Unix permission bits.
		if err := os.Rename(filepath.Join(dir, "tlego-bad"), filepath.Join(dir, "tlego-bad.exe")); err != nil {
			t.Fatal(err)
		}
	} else if err := os.Chmod(filepath.Join(dir, "tlego-bad"), 0755); err != nil {
		t.Fatal(err)
	}
	err = Run(context.Background(), []string{"bad"}, "v", strings.NewReader(""), &bytes.Buffer{}, &bytes.Buffer{})
	if !errors.As(err, &exitErr) || exitErr.Code != 126 {
		t.Fatalf("launch error = %#v", err)
	}
}

func TestFindDoesNotSearchCurrentDirectory(t *testing.T) {
	dir := t.TempDir()
	makeExec(t, dir, "tlego-local", "exit 0")
	t.Setenv("PATH", "")
	old, err := os.Getwd()
	if err != nil {
		t.Fatal(err)
	}
	if err := os.Chdir(dir); err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = os.Chdir(old) })
	if _, err := Find("local"); !errors.Is(err, exec.ErrNotFound) {
		t.Fatalf("Find error = %v", err)
	}
	if err := os.Chdir(old); err != nil {
		t.Fatal(err)
	}
	pathDir := t.TempDir()
	pathExecutable := makeExec(t, pathDir, "tlego-selected", "exit 0")
	makeExec(t, dir, "tlego-selected", "exit 1")
	t.Setenv("PATH", pathDir)
	got, err := Find("selected")
	if err != nil {
		t.Fatal(err)
	}
	if got != pathExecutable {
		t.Fatalf("Find selected implicit cwd executable %q, want PATH executable %q", got, pathExecutable)
	}
	t.Setenv("PATH", ".")
	if err := os.Chdir(dir); err != nil {
		t.Fatal(err)
	}
	if _, err := Find("local"); !errors.Is(err, exec.ErrDot) {
		t.Fatalf("explicit relative PATH error = %v, want ErrDot", err)
	}
}

func TestDiscoverSortedAndUsesFirstPathMatch(t *testing.T) {
	first, second := t.TempDir(), t.TempDir()
	a := makeExec(t, first, "tlego-zeta", "exit 0")
	b := makeExec(t, first, "tlego-alpha", "exit 0")
	makeExec(t, second, "tlego-alpha", "exit 0")
	if err := os.Mkdir(filepath.Join(first, "tlego-dir"), 0755); err != nil {
		t.Fatal(err)
	}
	t.Setenv("PATH", first+string(os.PathListSeparator)+second)
	got := Discover()
	if len(got) != 2 || got[0].Name != "alpha" || got[1].Name != "zeta" {
		t.Fatalf("Discover = %#v", got)
	}
	if got[0].Executable != b || got[1].Executable != a || len(got[0].Candidates) != 2 || got[0].Candidates[1] != filepath.Join(second, "tlego-alpha") {
		t.Fatalf("paths = %#v", got)
	}
}

func TestValidNameASCII(t *testing.T) {
	for _, name := range []string{"a", "A9-x"} {
		if !ValidName(name) {
			t.Errorf("ValidName(%q) = false", name)
		}
	}
	for _, name := range []string{"", "9a", "-a", "a_b", "é"} {
		if ValidName(name) {
			t.Errorf("ValidName(%q) = true", name)
		}
	}
}

func TestInteractiveInputDoesNotTreatPipesAsTerminals(t *testing.T) {
	if InteractiveInput(strings.NewReader("piped")) {
		t.Fatal("reader is not a terminal")
	}
	r, w, err := os.Pipe()
	if err != nil {
		t.Fatal(err)
	}
	defer r.Close()
	defer w.Close()
	if InteractiveInput(r) {
		t.Fatal("pipe file is not a terminal")
	}
}

func TestCanceledInvocationDoesNotResolveOrLaunchExtension(t *testing.T) {
	t.Setenv("PATH", t.TempDir())
	ctx, cancel := context.WithCancel(context.Background())
	cancel()
	err := Run(ctx, []string{"missing"}, "v", strings.NewReader(""), &bytes.Buffer{}, &bytes.Buffer{})
	var exitErr *ExitError
	if !errors.As(err, &exitErr) || exitErr.Code != 130 || !errors.Is(err, context.Canceled) {
		t.Fatalf("canceled invocation = %#v", err)
	}
}
