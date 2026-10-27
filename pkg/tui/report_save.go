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
	mode := os.FileMode(0o644)
	info, err := os.Stat(path)
	if err == nil {
		mode = info.Mode() & (os.ModePerm | os.ModeSetuid | os.ModeSetgid | os.ModeSticky)
	} else if !os.IsNotExist(err) {
		return err
	}
	f, err := create(filepath.Dir(path), ".tlego-report-*")
	if err != nil {
		return err
	}
	defer os.Remove(f.Name())
	if err = f.Chmod(mode); err != nil {
		_ = f.Close()
		return err
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
