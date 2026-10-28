package tui

import (
	"io"
	"os"
	"path/filepath"
)

type reportTemp interface {
	io.Writer
	Close() error
	Name() string
	Chmod(os.FileMode) error
}

func writeReport(path, output string) error {
	return writeReportWith(path, []byte(output), func(dir, pattern string) (reportTemp, error) { return os.CreateTemp(dir, pattern) })
}

func writeReportWith(path string, data []byte, create func(string, string) (reportTemp, error)) error {
	info, err := os.Lstat(path)
	if err != nil && !os.IsNotExist(err) {
		return err
	}
	if err == nil && info.Mode()&os.ModeSymlink != 0 {
		path, err = filepath.EvalSymlinks(path)
		if err != nil {
			return err
		}
		info, err = os.Stat(path)
		if err != nil {
			return err
		}
	}
	f, err := create(filepath.Dir(path), ".tlego-report-*")
	if err != nil {
		return err
	}
	defer os.Remove(f.Name())
	// CreateTemp keeps new reports private and respects a restrictive umask.
	if info != nil {
		mode := info.Mode() & (os.ModePerm | os.ModeSetuid | os.ModeSetgid | os.ModeSticky)
		if err = f.Chmod(mode); err != nil {
			_ = f.Close()
			return err
		}
	}
	n, err := f.Write(data)
	if err == nil && n != len(data) {
		err = io.ErrShortWrite
	}
	closeErr := f.Close()
	if err != nil {
		return err
	}
	if closeErr != nil {
		return closeErr
	}
	return os.Rename(f.Name(), path)
}
