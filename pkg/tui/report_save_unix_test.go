//go:build unix

package tui

import (
	"os"
	"path/filepath"
	"syscall"
	"testing"
)

func TestNewReportKeepsPrivatePermissions(t *testing.T) {
	for _, mask := range []int{0022, 0077, 0777} {
		path := filepath.Join(t.TempDir(), "report")
		err := func() error {
			old := syscall.Umask(mask)
			defer syscall.Umask(old)
			return writeReport(path, "report")
		}()
		if err != nil {
			t.Fatalf("umask %04o: %v", mask, err)
		}
		info, err := os.Stat(path)
		if err != nil {
			t.Fatal(err)
		}
		want := os.FileMode(0600 &^ mask)
		if info.Mode().Perm() != want {
			t.Fatalf("umask %04o: mode %04o, want %04o", mask, info.Mode().Perm(), want)
		}
	}
}

func TestWriteReportRespectsTargetPermissionsAndType(t *testing.T) {
	if os.Geteuid() == 0 {
		t.Skip("root bypasses file permissions")
	}
	dir := t.TempDir()
	readOnly := filepath.Join(dir, "read-only.txt")
	if err := os.WriteFile(readOnly, []byte("old"), 0o444); err != nil {
		t.Fatal(err)
	}
	if err := writeReport(readOnly, "new"); err == nil {
		t.Error("overwrote a read-only file")
	}
	if got, _ := os.ReadFile(readOnly); string(got) != "old" {
		t.Errorf("read-only file content = %q", got)
	}

	fifo := filepath.Join(dir, "fifo")
	if err := syscall.Mkfifo(fifo, 0o600); err != nil {
		t.Fatal(err)
	}
	if err := writeReport(fifo, "new"); err == nil {
		t.Error("replaced a FIFO")
	}
	if info, err := os.Lstat(fifo); err != nil || info.Mode()&os.ModeNamedPipe == 0 {
		t.Errorf("FIFO after save: %v, %v", info, err)
	}
}

func TestWriteReportUpdatesWritableFileInReadOnlyDirectory(t *testing.T) {
	if os.Geteuid() == 0 {
		t.Skip("root bypasses directory permissions")
	}
	dir := t.TempDir()
	target := filepath.Join(dir, "report.txt")
	if err := os.WriteFile(target, []byte("old"), 0o644); err != nil {
		t.Fatal(err)
	}
	if err := os.Chmod(dir, 0o555); err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = os.Chmod(dir, 0o755) })
	if err := writeReport(target, "new"); err != nil {
		t.Fatal(err)
	}
	if got, _ := os.ReadFile(target); string(got) != "new" {
		t.Errorf("content = %q", got)
	}
}
