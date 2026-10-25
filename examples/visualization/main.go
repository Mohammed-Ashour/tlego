// visualization exports a configured group's elements using validated retrieval.
package main

import (
	"context"
	"fmt"
	"os"
	"time"

	"github.com/Mohammed-Ashour/tlego/pkg/tui/data"
	"github.com/Mohammed-Ashour/tlego/pkg/visual"
)

func main() {
	if err := run(); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}
func run() error {
	if len(os.Args) != 2 {
		return fmt.Errorf("usage: go run ./examples/visualization <group-name>")
	}
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	records, meta, err := data.NewStore("", 12*time.Hour).FetchGroupTLEs(ctx, os.Args[1])
	if err != nil {
		return err
	}
	if meta.Warning != "" {
		fmt.Fprintln(os.Stderr, meta.Warning)
	}
	if len(records) == 0 || len(records) > 64 {
		return fmt.Errorf("choose a group with 1 to 64 satellites")
	}
	satellites := make([]visual.SatelliteData, 0, len(records))
	start := time.Now().UTC()
	for _, record := range records {
		points, err := visual.CreateOrbitPointsAt(record, 360, start)
		if err != nil {
			return err
		}
		epoch, err := record.Time()
		if err != nil {
			return err
		}
		satellites = append(satellites, visual.SatelliteData{Name: record.Name, NORADID: record.NoradID, Epoch: epoch, Points: points})
	}
	path, err := visual.WriteHTMLVisual(satellites, "group-orbits.html")
	if err != nil {
		return err
	}
	fmt.Println(path)
	return nil
}
