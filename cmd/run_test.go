package cmd

import (
	"bytes"
	"context"
	"encoding/json"
	"os"
	"path/filepath"
	"testing"
)

func TestMachineCommandParseErrorIsJSONOnStderrOnly(t *testing.T) {
	var stdout, stderr bytes.Buffer
	oldOut, oldErr := RootCmd.Writer, RootCmd.ErrWriter
	RootCmd.Writer, RootCmd.ErrWriter = &stdout, &stderr
	t.Cleanup(func() {
		if oldOut == nil {
			oldOut = os.Stdout
		}
		if oldErr == nil {
			oldErr = os.Stderr
		}
		RootCmd.Writer, RootCmd.ErrWriter = oldOut, oldErr
	})
	err := Run(context.Background(), []string{"tlego", "predict", "--format=json", "--unknown"})
	if err == nil || !IsReported(err) {
		t.Fatalf("error = %v, expected reported machine error", err)
	}
	if stdout.Len() != 0 {
		t.Fatalf("stdout = %q, want empty", stdout.String())
	}
	var record map[string]any
	if err := json.Unmarshal(bytes.TrimSpace(stderr.Bytes()), &record); err != nil {
		t.Fatalf("stderr is not one JSON document: %q (%v)", stderr.String(), err)
	}
	if record["kind"] != "error" {
		t.Fatalf("error record = %#v", record)
	}
}

func TestMachineCommandHelpRemainsHumanReadable(t *testing.T) {
	var stdout, stderr bytes.Buffer
	oldOut, oldErr := RootCmd.Writer, RootCmd.ErrWriter
	RootCmd.Writer, RootCmd.ErrWriter = &stdout, &stderr
	t.Cleanup(func() {
		if oldOut == nil {
			oldOut = os.Stdout
		}
		if oldErr == nil {
			oldErr = os.Stderr
		}
		RootCmd.Writer, RootCmd.ErrWriter = oldOut, oldErr
	})
	if err := Run(context.Background(), []string{"tlego", "predict", "--format=json", "--help"}); err != nil {
		t.Fatal(err)
	}
	if stdout.Len() == 0 || !bytes.Contains(stdout.Bytes(), []byte("predict")) {
		t.Fatalf("help output = %q", stdout.String())
	}
	if stderr.Len() != 0 {
		t.Fatalf("stderr = %q, want empty", stderr.String())
	}
}

func TestNativePluginCommandWinsOverExecutable(t *testing.T) {
	dir := t.TempDir()
	marker := filepath.Join(dir, "ran")
	if err := os.WriteFile(filepath.Join(dir, "tlego-plugin"), []byte("#!/bin/sh\ntouch '"+marker+"'\n"), 0755); err != nil {
		t.Fatal(err)
	}
	t.Setenv("PATH", dir)
	if err := Run(context.Background(), []string{"tlego", "plugin"}); err != nil {
		t.Fatal(err)
	}
	if _, err := os.Stat(marker); !os.IsNotExist(err) {
		t.Fatalf("extension ran despite native command: stat err %v", err)
	}
}

func TestMalformedNativeCommandDoesNotFallBackToExtension(t *testing.T) {
	dir := t.TempDir()
	marker := filepath.Join(dir, "ran")
	if err := os.WriteFile(filepath.Join(dir, "tlego-predict"), []byte("#!/bin/sh\ntouch '"+marker+"'\n"), 0755); err != nil {
		t.Fatal(err)
	}
	t.Setenv("PATH", dir)
	err := Run(context.Background(), []string{"tlego", "predict", "--unknown"})
	if err == nil {
		t.Fatal("expected native command usage error")
	}
	if _, err := os.Stat(marker); !os.IsNotExist(err) {
		t.Fatalf("extension ran after malformed native invocation: stat err %v", err)
	}
}

func TestTopLevelCommandHandlesSeparatorAndBuiltinFlags(t *testing.T) {
	name, sep, ok := topLevelCommand([]string{"--", "outer", "--help"})
	if !ok || !sep || name != "outer" {
		t.Fatalf("result = %q %v %v", name, sep, ok)
	}
	if _, _, ok := topLevelCommand([]string{"--help", "outer"}); ok {
		t.Fatal("help must remain a native root flag")
	}
	if !hasNativeCommand("plugin") {
		t.Fatal("plugin command should be registered")
	}
}
