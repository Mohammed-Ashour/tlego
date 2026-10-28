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
