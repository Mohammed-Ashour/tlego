package cmd

import (
	"bytes"
	"context"
	"os"
	"path/filepath"
	"testing"
)

func TestPluginInitCreatesProjectAndRejectsNativeNames(t *testing.T) {
	target := filepath.Join(t.TempDir(), "new-extension")
	var out bytes.Buffer
	command := newPluginInitCommand()
	command.Writer = &out
	if err := command.Run(context.Background(), []string{"init", "--language", "python", "--dir", target, "summary"}); err != nil {
		t.Fatal(err)
	}
	if !bytes.Contains(out.Bytes(), []byte(target)) {
		t.Fatalf("missing created path: %s", out.String())
	}
	if _, err := os.Stat(filepath.Join(target, "tlego_summary.py")); err != nil {
		t.Fatal(err)
	}
	for _, name := range []string{"predict", "plugin", "serve", "help", "version"} {
		path := filepath.Join(t.TempDir(), "should-not-exist")
		command := newPluginInitCommand()
		command.Writer = &out
		if err := command.Run(context.Background(), []string{"init", "--dir", path, name}); err == nil {
			t.Fatalf("reserved command %q was accepted", name)
		}
		if _, err := os.Stat(path); !os.IsNotExist(err) {
			t.Fatalf("reserved name created a directory: %s", path)
		}
	}
}
