package cmd

import (
	"context"
	"fmt"
	"math/rand"
	"strconv"
	"strings"

	"github.com/Mohammed-Ashour/tlego/pkg/celestrak"
	"github.com/Mohammed-Ashour/tlego/pkg/logger"
	visual "github.com/Mohammed-Ashour/tlego/pkg/visual"
	"github.com/urfave/cli/v3"
)

type Author struct {
	Name    string
	Email   string
	Website string
}

var RootCmd = &cli.Command{
	Name:        "tlego",
	Version:     "v0.0.25",
	Usage:       "A TLE client",
	UsageText:   "TLE Aggregator and visualizer client",
	Description: "tlego is a simple fast lightweight TLE aggregator and visualizer! built on GO",
	Authors: []any{
		Author{
			Name:    "Mohamed Ashour",
			Email:   "m.aly.ashour@gmail.com",
			Website: "blog.m-ashour.space",
		},
	},
	Commands: []*cli.Command{
		&cli.Command{
			Name:        "tle",
			Usage:       "tlego tle <NORAD-ID>",
			Description: "tlego tle <norad_id> : Finds and downloads the tle for the supported norad id",
			Action:      tleGrep,
			Category:    "TLE",
		},
		&cli.Command{
			Name:        "viz",
			Usage:       "tlego viz <NORAD-ID>",
			Description: "tlego viz <norad_id> : Finds and creates a visualization for the supported norad id",
			Action:      satViz,
			Category:    "Visual",
		},
		&cli.Command{
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
							return err
						}
						for _, group := range config.SatelliteGroups {
							if strings.ToLower(g) == strings.ToLower(group.Name) {
								return nil
							}

						}
						return nil
					},
				},
			},
			Action: listAction,
		},
	},
}

func tleGrep(ctx context.Context, cmd *cli.Command) error {
	args := cmd.Args()
	if args.Len() == 0 {
		fmt.Println("Please provide a NORAD ID for the requested sat")
		return fmt.Errorf("Please provide a NORAD ID for the requested sat")
	}

	noradId := args.First()
	tle, err := celestrak.GetSatelliteTLEByNoradID(noradId)
	if err != nil {
		return err
	}
	fmt.Println(tle)
	return nil
}

func satViz(ctx context.Context, cmd *cli.Command) error {
	args := cmd.Args()
	if args.Len() != 1 {
		return fmt.Errorf("the viz (visualize) command only supports on argument mode at the moment")
	}
	noradId := args.First()
	if _, err := strconv.Atoi(noradId); err != nil {
		return fmt.Errorf("noradId is only digits %s was passed.\n", noradId)
	}
	tle, err := celestrak.GetSatelliteTLEByNoradID(noradId)
	if err != nil {
		return fmt.Errorf("Can't get TLEs from Celestrak, %s", err)
	}
	satData := make([]visual.SatelliteData, 1)
	points, err := visual.CreateOrbitPoints(tle, 360)
	if err != nil {
		return fmt.Errorf("Failed to create orbit points, %s", err)
	}

	r := rand.Intn(256)
	g := rand.Intn(256)
	b := rand.Intn(256)

	satData = []visual.SatelliteData{
		visual.SatelliteData{
			Name:   tle.Name,
			Points: points,
			Color:  fmt.Sprintf("#%02X%02X%02X", r, g, b),
		},
	}

	htmlFileName := visual.CreateHTMLVisual(satData, noradId)
	logger.Info("Created an html with orbit visualization", "filename", htmlFileName)
	return nil
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
	return fmt.Errorf("No sat-group was provided", "--sat-group", groupFlag)

}
