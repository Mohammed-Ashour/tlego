package cmd

import (
	"context"
	"fmt"
	"strconv"
	"strings"

	"github.com/Mohammed-Ashour/tlego/pkg/celestrak"
	"github.com/urfave/cli/v3"
)

func init() {
	RootCmd.Commands = append(RootCmd.Commands, &cli.Command{
		Name:     "list",
		Usage:    "tlego list --sat-group <satellite-group>",
		Category: "TLE",
		Flags: []cli.Flag{
			&cli.StringFlag{
				Name:     "sat-group",
				Usage:    "tlego list --sat-group <sat-group>",
				Category: "TLE",
				Validator: func(g string) error {
					config, err := celestrak.ReadCelestrakConfig()
					if err != nil {
						return fmt.Errorf("failed to read Celestrak configuration: %w", err)
					}
					for _, group := range config.SatelliteGroups {
						if strings.EqualFold(g, group.Name) {
							return nil
						}
					}
					return fmt.Errorf("invalid satellite group: %s. Use 'tlego list' to see available groups", g)
				},
			},
		},
		Action: listAction,
	})

}

func listAction(ctx context.Context, cmd *cli.Command) error {
	config, err := celestrak.ReadCelestrakConfig()
	if err != nil {
		return err
	}
	groupFlag := cmd.String("sat-group")
	if groupFlag != "" {
		tles, err := celestrak.GetSatelliteGroupTLEs(groupFlag, config)
		for _, tle := range tles {
			fmt.Println(tle)
		}
		return err
	}
	fmt.Println("Groups supported : ")
	for _, satGroup := range config.SatelliteGroups {
		fmt.Printf("\t%s\n", satGroup.Name)
	}
	return fmt.Errorf("no sat-group was provided: --sat-group=%s", groupFlag)
}
func validateNoradID(noradId string) error {
	if noradId == "" {
		return fmt.Errorf("NORAD ID cannot be empty")
	}
	if _, err := strconv.Atoi(noradId); err != nil {
		return fmt.Errorf("NORAD ID must be numeric: %s", noradId)
	}
	return nil
}
