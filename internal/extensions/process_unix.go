//go:build !windows

package extensions

import (
	"context"
	"os/exec"
	"syscall"
)

// Non-interactive extensions get a private process group for tree cancellation.
// Terminal-driven extensions share the caller's foreground group so reads and
// terminal-generated signals continue to work naturally.
func configureCommand(cmd *exec.Cmd, interactive bool) {
	if !interactive {
		cmd.SysProcAttr = &syscall.SysProcAttr{Setpgid: true}
	}
}

func runCommand(ctx context.Context, cmd *exec.Cmd, interactive bool) error {
	if err := cmd.Start(); err != nil {
		return err
	}
	done := make(chan error, 1)
	go func() { done <- cmd.Wait() }()
	select {
	case err := <-done:
		return err
	case <-ctx.Done():
		if cmd.Process != nil {
			pid := cmd.Process.Pid
			if !interactive {
				pid = -pid
			}
			if err := syscall.Kill(pid, syscall.SIGKILL); err != nil && err != syscall.ESRCH {
				// The interactive process group contains tlego too, so only the
				// extension process is safe to signal for a programmatic cancel.
				_ = cmd.Process.Kill()
			}
		}
		return <-done
	}
}

func exitStatus(err *exec.ExitError) int {
	if code := err.ExitCode(); code >= 0 {
		return code
	}
	if status, ok := err.Sys().(syscall.WaitStatus); ok && status.Signaled() {
		return 128 + int(status.Signal())
	}
	return 1
}
