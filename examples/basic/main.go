// basic exports a local TLE file without accessing a provider.
package main

import (
	"fmt"
	"os"

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
		return fmt.Errorf("usage: go run ./examples/basic <TLE-file>")
	}
	records, err := data.ReadTLEFile(os.Args[1])
	if err != nil {
		return err
	}
	// Use a shared epoch to make comparisons between records meaningful.
	start, err := records[0].Time()
	if err != nil {
		return err
	}
	satellites := make([]visual.SatelliteData, 0, len(records))
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
	path, err := visual.WriteHTMLVisual(satellites, "orbits.html")
	if err != nil {
		return err
	}
	fmt.Println(path)
	return nil
}
