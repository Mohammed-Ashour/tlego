package main

import (
	"context"
	"os"

	"github.com/Mohammed-Ashour/tlego/cmd"
)

func main() {
	cmd.RootCmd.Run(context.Background(), os.Args)

}
