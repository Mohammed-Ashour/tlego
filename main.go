package main

import (
	"context"
	"fmt"
	"os"

	"github.com/Mohammed-Ashour/tlego/cmd"
)

func main() {
	if err := cmd.Run(context.Background(), os.Args); err != nil {
		if code, ok := cmd.ExitCode(err); ok {
			if !cmd.IsReported(err) {
				fmt.Fprintln(os.Stderr, err)
			}
			os.Exit(code)
		}
		if cmd.IsReported(err) {
			os.Exit(1)
		}
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}
