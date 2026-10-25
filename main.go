package main

import (
	"context"
	"fmt"
	"os"

	"github.com/Mohammed-Ashour/tlego/cmd"
)

func main() {
	if err := cmd.RootCmd.Run(context.Background(), os.Args); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}
