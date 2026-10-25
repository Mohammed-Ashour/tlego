//go:build !windows

package extensions

import (
	"context"
	"errors"
	"os/exec"
	"testing"
)

func TestConfigureCommandSeparatesOnlyNonInteractiveExtensions(t *testing.T) {
	interactive := exec.Command("true")
	configureCommand(interactive, true)
	if interactive.SysProcAttr != nil && interactive.SysProcAttr.Setpgid {
		t.Fatal("interactive command must share the foreground process group")
	}

	batch := exec.Command("true")
	configureCommand(batch, false)
	attrs := batch.SysProcAttr
	if attrs == nil || !attrs.Setpgid {
		t.Fatalf("non-interactive SysProcAttr = %#v, want Setpgid", batch.SysProcAttr)
	}
}

func TestCanceledCommandDoesNotStart(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	cancel()
	command := exec.Command("/bin/sh", "-c", "exit 0")
	configureCommand(command, false)
	err := runCommand(ctx, command, false)
	if !errors.Is(err, context.Canceled) {
		t.Fatalf("canceled command error = %v", err)
	}
	if command.Process != nil {
		t.Fatal("already-canceled command still started a process")
	}
}
