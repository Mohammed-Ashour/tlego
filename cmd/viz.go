package cmd

import (
	"context"
	"fmt"
	"math/rand"
	"strconv"

	"github.com/Mohammed-Ashour/tlego/pkg/celestrak"
	"github.com/Mohammed-Ashour/tlego/pkg/logger"
	visual "github.com/Mohammed-Ashour/tlego/pkg/visual"
	"github.com/urfave/cli/v3"
)

func init() {
	RootCmd.Commands = append(RootCmd.Commands, &cli.Command{
		Name:        "viz",
		Usage:       "tlego viz <NORAD-ID>",
		Description: "Visualize the orbit of a satellite using its NORAD ID.",
		Action:      visualizeSatelliteOrbit,
		Category:    "Visualization",
	})
}

func visualizeSatelliteOrbit(ctx context.Context, cmd *cli.Command) error {
	args := cmd.Args()
	if args.Len() != 1 {
		return fmt.Errorf("the viz (visualize) command only supports on argument mode at the moment")
	}
	noradId := args.First()
	err := validateNoradID(noradId)
	if err != nil {
		return err
	}
	if _, err := strconv.Atoi(noradId); err != nil {
		return fmt.Errorf("noradId is only digits %s was passed.\n", noradId)
	}
	tle, err := celestrak.GetSatelliteTLEByNoradID(noradId)
	if err != nil {
		return fmt.Errorf("failed to fetch TLE for NORAD ID %s: %w", noradId, err)
	}
	satData := make([]visual.SatelliteData, 1)
	points, err := visual.CreateOrbitPoints(tle, 36)
	if err != nil {
		return fmt.Errorf("failed to create orbit points for satellite %s: %w", tle.Name, err)
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
