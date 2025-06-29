package main

import (
	"context"
	"os"

	"github.com/Mohammed-Ashour/tlego/cmd"
	"github.com/Mohammed-Ashour/tlego/pkg/server"
)

func main() {
	cmd.RootCmd.Run(context.Background(), os.Args)
	server.StartServer()
}
