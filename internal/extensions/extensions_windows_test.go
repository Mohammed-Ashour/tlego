//go:build windows

package extensions

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestDiscoverSelectsAccordingToPATHEXTWithoutRunningCandidates(t *testing.T) {
	dir := t.TempDir()
	exe := filepath.Join(dir, "TLEGO-job.exe")
	com := filepath.Join(dir, "tlego-job.com")
	for _, path := range []string{exe, com} {
		if err := os.WriteFile(path, []byte("not executed"), 0644); err != nil {
			t.Fatal(err)
		}
	}
	t.Setenv("PATH", dir)
	t.Setenv("PATHEXT", ".EXE;.COM")
	got := Discover()
	if len(got) != 1 || got[0].Name != "job" {
		t.Fatalf("Discover() = %#v", got)
	}
	if !filepath.IsAbs(got[0].Executable) || !samePath(got[0].Executable, exe) {
		t.Fatalf("selected path = %q, want %q", got[0].Executable, exe)
	}
	if len(got[0].Candidates) == 2 && (!samePath(got[0].Candidates[0], exe) || !samePath(got[0].Candidates[1], com)) {
		t.Fatalf("candidate order must start with selected executable and retain COM collision: %#v", got[0].Candidates)
	}
	if len(got[0].Candidates) != 2 {
		t.Fatalf("candidates = %#v", got[0].Candidates)
	}
}

func TestWindowsBatchExtensionIsNotLaunchedThroughShell(t *testing.T) {
	dir := t.TempDir()
	if err := os.WriteFile(filepath.Join(dir, "tlego-script.cmd"), []byte("@echo off\r\n"), 0644); err != nil {
		t.Fatal(err)
	}
	t.Setenv("PATH", dir)
	t.Setenv("PATHEXT", ".CMD")
	if _, err := Find("script"); err == nil {
		t.Fatal("Find should reject batch extensions")
	}
	if got := Discover(); len(got) != 0 {
		t.Fatalf("batch extension was listed as launchable: %#v", got)
	}
}

func TestFindIgnoresImplicitWindowsCurrentDirectory(t *testing.T) {
	old, err := os.Getwd()
	if err != nil {
		t.Fatal(err)
	}
	cwd := t.TempDir()
	if err := os.WriteFile(filepath.Join(cwd, "tlego-shadow.exe"), []byte("not executed"), 0644); err != nil {
		t.Fatal(err)
	}
	if err := os.Chdir(cwd); err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = os.Chdir(old) })
	pathDir := t.TempDir()
	t.Setenv("PATH", pathDir)
	t.Setenv("PATHEXT", ".EXE;.COM")
	if _, err := Find("shadow"); err == nil {
		t.Fatal("Find used a current-directory candidate omitted from PATH")
	}
	expected := filepath.Join(pathDir, "tlego-shadow.exe")
	if err := os.WriteFile(expected, []byte("not executed"), 0644); err != nil {
		t.Fatal(err)
	}
	got, err := Find("shadow")
	if err != nil {
		t.Fatal(err)
	}
	if !samePath(got, expected) {
		t.Fatalf("Find() = %q, want %q", got, expected)
	}
}

func samePath(a, b string) bool { return strings.EqualFold(filepath.Clean(a), filepath.Clean(b)) }
