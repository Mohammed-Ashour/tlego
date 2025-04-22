package cmd

import (
	"context"
	"fmt"

	"github.com/Mohammed-Ashour/tlego/pkg/celestrak"
	"github.com/urfave/cli/v3"
)

func init() {
	RootCmd.Commands = append(RootCmd.Commands, &cli.Command{
		Name:        "tle",
		Usage:       "tlego tle <NORAD-ID>",
		Description: "Fetches the Two-Line Element (TLE) data for a satellite identified by its NORAD ID. The NORAD ID is a unique identifier assigned to each satellite. Example: tlego tle 25544 (for the ISS).",
		Action:      tleGrep,
		Category:    "TLE",
	})
}
func tleGrep(ctx context.Context, cmd *cli.Command) error {
	args := cmd.Args()
	if args.Len() == 0 {
		fmt.Println("Please provide a NORAD ID for the requested sat")
		return fmt.Errorf("please provide a NORAD ID for the requested sat")
	}

	noradId := args.First()
	err := validateNoradID(noradId)
	if err != nil {
		return err
	}
	tle, err := celestrak.GetSatelliteTLEByNoradID(noradId)
	if err != nil {
		return err
	}
	fmt.Println(tle)
	return nil
}
