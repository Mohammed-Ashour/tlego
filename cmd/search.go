package cmd

import (
	"context"
	"fmt"
	"strings"

	"github.com/Mohammed-Ashour/tlego/pkg/celestrak"
	"github.com/urfave/cli/v3"
)

func init() {
	RootCmd.Commands = append(RootCmd.Commands, &cli.Command{
		Name:        "search",
		Usage:       "tlego search <keyword>",
		Description: "Search for satellites by name or partial name match.",
		Action:      searchSatellites,
		Category:    "Search",
	})
}

func searchSatellites(ctx context.Context, cmd *cli.Command) error {
	args := cmd.Args()
	if args.Len() == 0 {
		return fmt.Errorf("please provide a keyword to search for")
	}

	keyword := strings.ToLower(args.First())

	// Load satellite groups from the configuration
	config, err := celestrak.ReadCelestrakConfig()
	if err != nil {
		return fmt.Errorf("failed to read Celestrak configuration: %w", err)
	}

	fmt.Printf("Searching for satellites matching keyword: %q\n", keyword)

	// Iterate through all satellite groups and search for matches
	var matches []string
	for _, group := range config.SatelliteGroups {
		tles, err := celestrak.GetSatelliteGroupTLEs(group.Name, config)
		if err != nil {
			fmt.Printf("Warning: Failed to fetch TLEs for group %q: %v\n", group.Name, err)
			continue
		}

		for _, tle := range tles {
			if strings.Contains(strings.ToLower(tle.Name), keyword) {
				matches = append(matches, fmt.Sprintf("Name: %s | NORAD ID: %s", tle.Name, tle.NoradID))
			}
		}
	}

	// Display results
	if len(matches) == 0 {
		fmt.Printf("No satellites found matching keyword: %q\n", keyword)
		return nil
	}

	fmt.Println("Matching Satellites:")
	for _, match := range matches {
		fmt.Println(match)
	}

	return nil
}
