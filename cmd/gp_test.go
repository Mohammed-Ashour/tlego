package cmd

import (
	"bytes"
	"context"
	"encoding/json"
	"math"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/Mohammed-Ashour/tlego/internal/catalog"
	"github.com/Mohammed-Ashour/tlego/internal/output"
	"github.com/urfave/cli/v3"
)

func TestGPJSONCommandsPreserveLargerIDs(t *testing.T) {
	for _, id := range []string{"25544", "100001", "799500001"} {
		for _, factory := range []func() *cli.Command{newPredictCommand, newReportCommand, newPassesCommand} {
			c := factory()
			var stdout, stderr bytes.Buffer
			c.Writer = &stdout
			c.ErrWriter = &stderr
			args := []string{c.Name, "--file", "../internal/elements/testdata/" + id + ".json", "--time", "2026-10-24T05:01:11Z", "--format=json"}
			if c.Name == "passes" {
				args = append(args, "--lat", "51.48", "--lon", "0", "--duration", "1h")
			}
			if err := c.Run(context.Background(), args); err != nil {
				t.Fatalf("%s/%s: %v %s", c.Name, id, err, stderr.String())
			}
			var doc struct {
				Data struct {
					CatalogID   string          `json:"catalog_id"`
					TLE         string          `json:"tle"`
					ElementData json.RawMessage `json:"element_data"`
				} `json:"data"`
				Provenance output.Provenance `json:"provenance"`
			}
			if err := json.Unmarshal(stdout.Bytes(), &doc); err != nil {
				t.Fatal(err)
			}
			if doc.Data.CatalogID != id || doc.Provenance.SourceFormat != "gp-json" {
				t.Fatalf("lost ID or provenance: %s", stdout.String())
			}
			if c.Name == "report" && (doc.Data.TLE != "" || !bytes.Contains(doc.Data.ElementData, []byte(id))) {
				t.Fatal("GP report synthesized or lost elements")
			}
		}
	}
}

func TestTLEAndGPJSONPositionsAgree(t *testing.T) {
	var want output.PositionRecord
	for _, file := range []string{"../examples/tui-demo/iss.tle", "../internal/elements/testdata/25544.json"} {
		c := newPredictCommand()
		var out bytes.Buffer
		c.Writer = &out
		if err := c.Run(context.Background(), []string{"predict", "--file", file, "--time", "2026-10-24T05:01:11Z", "--format=json"}); err != nil {
			t.Fatal(err)
		}
		var doc struct {
			Data output.PositionRecord `json:"data"`
		}
		if err := json.Unmarshal(out.Bytes(), &doc); err != nil {
			t.Fatal(err)
		}
		if want.CatalogID != "" && (doc.Data.CatalogID != want.CatalogID || doc.Data.EvaluatedAt != want.EvaluatedAt || math.Abs(doc.Data.LatitudeDeg-want.LatitudeDeg) > 1e-8 || math.Abs(doc.Data.LongitudeDeg-want.LongitudeDeg) > 1e-8 || math.Abs(doc.Data.AltitudeKm-want.AltitudeKm) > 1e-6 || math.Abs(doc.Data.SpeedKmS-want.SpeedKmS) > 1e-9) {
			t.Fatalf("equivalent inputs disagree beyond millimetre tolerance: %+v %+v", want, doc.Data)
		}
		want = doc.Data
	}
}
func TestGPJSONOrbitExport(t *testing.T) {
	path := filepath.Join(t.TempDir(), "orbit.html")
	c := newVizCommand()
	var out bytes.Buffer
	c.Writer = &out
	if err := c.Run(context.Background(), []string{"viz", "--file", "../internal/elements/testdata/799500001.json", "--points", "8", "--output", path}); err != nil {
		t.Fatal(err)
	}
	data, err := os.ReadFile(path)
	if err != nil {
		t.Fatal(err)
	}
	if !bytes.Contains(data, []byte(`"norad_id":"799500001"`)) {
		t.Fatal("export truncated catalog ID")
	}
}

func TestReportExportsCorrectedOrbitClass(t *testing.T) {
	for _, tc := range []struct{ name, motion, inclination, class string }{
		{"stationary candidate", "1.002743960677476", "0", "GEO"},
		{"inclined synchronous", "1.002743960677476", "20", "GSO"},
		{"old false GEO", "0.9094608139888118", "0", "HEO"},
	} {
		t.Run(tc.name, func(t *testing.T) {
			c := newReportCommand()
			c.Reader = strings.NewReader(`{"NORAD_CAT_ID":25544,"EPOCH":"2026-10-24T05:01:11Z","MEAN_MOTION":` + tc.motion + `,"ECCENTRICITY":0,"INCLINATION":` + tc.inclination + `,"RA_OF_ASC_NODE":0,"ARG_OF_PERICENTER":0,"MEAN_ANOMALY":0,"BSTAR":0,"MEAN_MOTION_DOT":0,"MEAN_MOTION_DDOT":0}`)
			var out bytes.Buffer
			c.Writer = &out
			if err := c.Run(context.Background(), []string{"report", "--file", "-", "--time", "2026-10-24T05:01:11Z", "--format=json"}); err != nil {
				t.Fatal(err)
			}
			var doc struct {
				Data output.ReportRecord `json:"data"`
			}
			if err := json.Unmarshal(out.Bytes(), &doc); err != nil {
				t.Fatal(err)
			}
			if doc.Data.Orbit.OrbitClassEstimate != tc.class {
				t.Fatalf("class = %s, want %s", doc.Data.Orbit.OrbitClassEstimate, tc.class)
			}
		})
	}
}
func TestUnsupportedInputFailsWithJSONError(t *testing.T) {
	c := newPredictCommand()
	c.Reader = strings.NewReader("<omm>unsupported XML</omm>")
	var out, errout bytes.Buffer
	c.Writer = &out
	c.ErrWriter = &errout
	err := c.Run(context.Background(), []string{"predict", "--file", "-", "--time", "2026-10-24T05:01:11Z", "--format=json"})
	if err == nil || out.Len() != 0 || !json.Valid(errout.Bytes()) {
		t.Fatalf("unsupported input: stdout=%q stderr=%q error=%v", out.String(), errout.String(), err)
	}
}

func TestListGPJSONCanBeReadBack(t *testing.T) {
	cache := t.TempDir()
	dir := filepath.Join(cache, "elements", "groups")
	if err := os.MkdirAll(dir, 0755); err != nil {
		t.Fatal(err)
	}
	b, err := os.ReadFile("../internal/elements/testdata/799500001.json")
	if err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join(dir, "space_stations.json"), b, 0644); err != nil {
		t.Fatal(err)
	}
	c := &cli.Command{Name: "list", Flags: append(cacheFlags(), &cli.StringFlag{Name: "sat-group"}), Action: listAction}
	var out bytes.Buffer
	c.Writer = &out
	if err := c.Run(context.Background(), []string{"list", "--cache-dir", cache, "--sat-group", "Space Stations"}); err != nil {
		t.Fatal(err)
	}
	records, err := catalog.ParseElements(out.Bytes())
	if err != nil || len(records) != 1 || records[0].CatalogID != "799500001" {
		t.Fatalf("output=%s err=%v", out.String(), err)
	}
}
