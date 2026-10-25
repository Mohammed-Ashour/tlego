//go:build !windows

package extensions

import (
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
