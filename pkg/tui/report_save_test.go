package tui

import (
	"os"
	"path/filepath"
	"runtime"
	"testing"
)

func makeReportSymlink(t *testing.T, target, link string) {
	t.Helper()
	if err := os.Symlink(target, link); err != nil {
		if runtime.GOOS == "windows" {
			t.Skipf("symlink creation unavailable: %v", err)
		}
		t.Fatal(err)
	}
}

func TestReportSavePreservesSymlinkAndUpdatesTarget(t *testing.T) {
	for _, kind := range []string{"absolute", "relative", "chain"} {
		t.Run(kind, func(t *testing.T) {
			dir := t.TempDir()
			targetDir := filepath.Join(dir, "targets")
			if err := os.Mkdir(targetDir, 0700); err != nil {
				t.Fatal(err)
			}
			target := filepath.Join(targetDir, "report")
			if err := os.WriteFile(target, []byte("old"), 0640); err != nil {
				t.Fatal(err)
			}
			before, err := os.Stat(target)
			if err != nil {
				t.Fatal(err)
			}
			destination := filepath.Join(dir, "link")
			linkTarget := target
			if kind == "relative" {
				linkTarget = filepath.Join("targets", "report")
			}
			makeReportSymlink(t, linkTarget, destination)
			if kind == "chain" {
				destination = filepath.Join(dir, "alias")
				linkTarget = "link"
				makeReportSymlink(t, linkTarget, destination)
			}
			if err := writeReport(destination, "new"); err != nil {
				t.Fatal(err)
			}
			data, err := os.ReadFile(target)
			if err != nil || string(data) != "new" {
				t.Fatalf("target=%q error=%v", data, err)
			}
			actualLink, err := os.Readlink(destination)
			if err != nil || actualLink != linkTarget {
				t.Fatalf("link=%q error=%v", actualLink, err)
			}
			after, err := os.Stat(target)
			if err != nil || after.Mode().Perm() != before.Mode().Perm() {
				t.Fatalf("target permissions changed: %v", err)
			}
			leftovers, err := filepath.Glob(filepath.Join(targetDir, ".tlego-report-*"))
			if err != nil || len(leftovers) != 0 {
				t.Fatalf("temporary files=%v error=%v", leftovers, err)
			}
		})
	}
}

func TestReportSymlinkFailurePreservesTarget(t *testing.T) {
	for _, mode := range []string{"write", "close"} {
		t.Run(mode, func(t *testing.T) {
			dir := t.TempDir()
			target, link := filepath.Join(dir, "target"), filepath.Join(dir, "link")
			if err := os.WriteFile(target, []byte("old"), 0600); err != nil {
				t.Fatal(err)
			}
			makeReportSymlink(t, target, link)
			err := writeReportWith(link, []byte("new"), func(dir, pattern string) (reportTemp, error) {
				f, err := os.CreateTemp(dir, pattern)
				if err != nil {
					return nil, err
				}
				return failingReportTemp{File: f, failWrite: mode == "write", failClose: mode == "close"}, nil
			})
			if err == nil {
				t.Fatal("expected save failure")
			}
			data, err := os.ReadFile(target)
			if err != nil || string(data) != "old" {
				t.Fatalf("target=%q error=%v", data, err)
			}
			if actual, err := os.Readlink(link); err != nil || actual != target {
				t.Fatalf("link=%q error=%v", actual, err)
			}
			entries, err := os.ReadDir(dir)
			if err != nil || len(entries) != 2 {
				t.Fatalf("directory=%v error=%v", entries, err)
			}
		})
	}
}

func TestReportRejectsDanglingSymlinkWithoutReplacingIt(t *testing.T) {
	dir := t.TempDir()
	target, link := filepath.Join(dir, "missing"), filepath.Join(dir, "link")
	makeReportSymlink(t, target, link)
	if err := writeReport(link, "new"); err == nil {
		t.Fatal("expected unresolved link error")
	}
	if actual, err := os.Readlink(link); err != nil || actual != target {
		t.Fatalf("link=%q error=%v", actual, err)
	}
	if _, err := os.Stat(target); !os.IsNotExist(err) {
		t.Fatalf("target changed: %v", err)
	}
}
