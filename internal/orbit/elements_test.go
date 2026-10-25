package orbit

import (
	"math"
	"testing"
	"time"

	"github.com/Mohammed-Ashour/go-satellite-v2/pkg/satellite"
	satelliteTLE "github.com/Mohammed-Ashour/go-satellite-v2/pkg/tle"
	"github.com/Mohammed-Ashour/tlego/internal/elements"
	"strings"
)

func TestDirectElementPropagatorMatchesTLEState(t *testing.T) {
	parsed, err := satelliteTLE.ParseTLE(issLine1, issLine2, "ISS (ZARYA)")
	if err != nil {
		t.Fatal(err)
	}
	record, err := elements.FromTLE(parsed)
	if err != nil {
		t.Fatal(err)
	}
	p, err := New(record)
	if err != nil {
		t.Fatal(err)
	}
	at := record.Epoch.Add(5 * time.Minute)
	got, err := p.At(at)
	if err != nil {
		t.Fatal(err)
	}
	// Independent values from python-sgp4 (Satrec.sgp4init, WGS-84) for the
	// same mean elements and full fractional epoch.
	for _, tc := range []struct {
		name      string
		got, want float64
	}{
		{"x", got.PositionTEMEKm.X, 4584.609344052476},
		{"y", got.PositionTEMEKm.Y, 1199.017858940223},
		{"z", got.PositionTEMEKm.Z, 4765.273702195226},
		{"vx", got.VelocityTEMEKmS.X, 0.793287241338032},
		{"vy", got.VelocityTEMEKmS.Y, 7.219080488287649},
		{"vz", got.VelocityTEMEKmS.Z, -2.575042335694851},
	} {
		tolerance := 1e-4
		if strings.HasPrefix(tc.name, "v") {
			tolerance = 1e-6
		}
		if math.Abs(tc.got-tc.want) > tolerance {
			t.Errorf("%s = %.12f, python-sgp4 reference %.12f", tc.name, tc.got, tc.want)
		}
	}
}

func TestDirectElementPropagatorRejectsInvalidRecord(t *testing.T) {
	record := elements.Record{CatalogID: "25544", Epoch: time.Date(2024, 1, 1, 0, 0, 0, 0, time.UTC), SourceFormat: "gp-json", MeanMotionRevDay: 15.5, Eccentricity: 1.2}
	if _, err := New(record); err == nil {
		t.Fatal("New() accepted eccentricity outside [0,1)")
	}
}

func TestOrbitInfoFromElements(t *testing.T) {
	record := elements.Record{CatalogID: "25544", Epoch: time.Date(2024, 1, 1, 0, 0, 0, 0, time.UTC), SourceFormat: "gp-json", MeanMotionRevDay: 15.5, Eccentricity: .001, InclinationDeg: 51.6}
	info, err := OrbitInfoFromElements(record)
	if err != nil {
		t.Fatal(err)
	}
	if info.InclinationDeg != record.InclinationDeg || info.Eccentricity != record.Eccentricity || info.MeanMotion != record.MeanMotionRevDay || info.PeriodMinutes <= 0 {
		t.Fatalf("unexpected orbit info: %+v", info)
	}
}

func TestDirectDeepSpaceValladoReference(t *testing.T) {
	// Vallado verification case 04632 from python-sgp4/SGP4-VER.TLE.
	// Expected vectors were computed with Satrec.sgp4init(WGS-84) from these
	// direct mean elements and the full epoch; evaluation times are whole seconds.
	record := elements.Record{
		CatalogID: "4632", Epoch: time.Date(2004, 1, 31, 21, 51, 25, 308576000, time.UTC), SourceFormat: "gp-json",
		MeanMotionRevDay: 1.20231981, Eccentricity: 0.1450506, InclinationDeg: 11.4628,
		RAANDeg: 273.1101, ArgumentOfPerigeeDeg: 207.6, MeanAnomalyDeg: 143.935, BStar: 0.001,
		MeanMotionDot: -0.00000084,
	}
	p, err := New(record)
	if err != nil {
		t.Fatal(err)
	}
	cases := []struct {
		minutes float64
		want    [6]float64
	}{
		{-5184, [6]float64{-29019.468397861296, 13820.840933863803, -5713.212407900483, -1.768170861247661, -3.235321737241966, -0.39522631374270867}},
		{0, [6]float64{2333.2502179055605, -41920.409308685455, -0.21314242117044463, 2.8263242054238886, -0.0651609946601315, 0.5709359148082156}},
		{1440, [6]float64{35212.04448624055, -21748.09420629471, 6876.634790771113, 1.266931608692043, 2.5779867156530045, 0.28501808821345637}},
		{4320, [6]float64{-17558.854674608046, 26462.014530649114, -3256.945747700758, -3.0832463123796043, -2.0924888974672553, -0.6460593413693382}},
	}
	for _, tc := range cases {
		at := record.Epoch.Add(time.Duration(tc.minutes * float64(time.Minute)))
		got, err := p.At(at)
		if err != nil {
			t.Fatalf("At(%g min): %v", tc.minutes, err)
		}
		values := [6]float64{got.PositionTEMEKm.X, got.PositionTEMEKm.Y, got.PositionTEMEKm.Z, got.VelocityTEMEKmS.X, got.VelocityTEMEKmS.Y, got.VelocityTEMEKmS.Z}
		for i, want := range tc.want {
			tolerance := 1e-4
			if i >= 3 {
				tolerance = 1e-6
			}
			if math.Abs(values[i]-want) > tolerance {
				t.Errorf("At(%g min) component %d = %.12f, python-sgp4 reference %.12f", tc.minutes, i, values[i], want)
			}
		}
	}
}

func TestDirectPropagatorCatalogIDDoesNotAffectState(t *testing.T) {
	record := elements.Record{CatalogID: "25544", Epoch: time.Date(2057, 1, 2, 3, 4, 5, 123000000, time.UTC), SourceFormat: "gp-json", MeanMotionRevDay: 15.5, Eccentricity: .001, InclinationDeg: 51.6, RAANDeg: 20, ArgumentOfPerigeeDeg: 30, MeanAnomalyDeg: 40, BStar: .0001, MeanMotionDot: .00001}
	other := record
	other.CatalogID = "123456789"
	a, err := New(record)
	if err != nil {
		t.Fatal(err)
	}
	b, err := New(other)
	if err != nil {
		t.Fatal(err)
	}
	at := time.Date(2057, 1, 3, 3, 4, 5, 999000000, time.UTC)
	got, err := a.At(at)
	if err != nil {
		t.Fatal(err)
	}
	again, err := b.At(at)
	if err != nil {
		t.Fatal(err)
	}
	if got != again {
		t.Fatalf("catalog ID changed propagated state: %+v vs %+v", got, again)
	}
	for _, tc := range []struct {
		name      string
		got, want float64
	}{
		{"x", got.PositionTEMEKm.X, -794.6032920242809}, {"y", got.PositionTEMEKm.Y, -4415.345504775956}, {"z", got.PositionTEMEKm.Z, -5116.174101429971},
		{"vx", got.VelocityTEMEKmS.X, 7.4327413138145735}, {"vy", got.VelocityTEMEKmS.Y, .6177519566093518}, {"vz", got.VelocityTEMEKmS.Z, -1.6818345370974288},
	} {
		tolerance := 1e-4
		if strings.HasPrefix(tc.name, "v") {
			tolerance = 1e-6
		}
		if math.Abs(tc.got-tc.want) > tolerance {
			t.Errorf("2057 %s = %.12f, python-sgp4 reference %.12f", tc.name, tc.got, tc.want)
		}
	}
}

func TestDirectGPAndTLERecordsUseEquivalentModel(t *testing.T) {
	// Use an integer-second epoch so the legacy engine's documented whole-second
	// epoch resolution and direct full-precision epoch represent the same instant.
	line1 := strings.Replace(issLine1, "08264.51782528", "08264.50000000", 1)
	parsed, err := satelliteTLE.ParseTLE(line1, issLine2, "ISS (ZARYA)")
	if err != nil {
		t.Fatal(err)
	}
	tleRecord, err := elements.FromTLE(parsed)
	if err != nil {
		t.Fatal(err)
	}
	gpRecord := tleRecord
	gpRecord.SourceFormat = "gp-json"
	gpRecord.LegacyTLE = nil
	directTLE, err := New(tleRecord)
	if err != nil {
		t.Fatal(err)
	}
	directGP, err := New(gpRecord)
	if err != nil {
		t.Fatal(err)
	}
	legacy := satellite.NewSatelliteFromTLE(parsed, satellite.GravityWGS84)
	at := tleRecord.Epoch.Add(7 * time.Hour)
	direct, err := directTLE.At(at)
	if err != nil {
		t.Fatal(err)
	}
	gp, err := directGP.At(at)
	if err != nil {
		t.Fatal(err)
	}
	old := At(legacy, at)
	if direct != gp {
		t.Fatalf("equivalent TLE and GP records differ: %+v vs %+v", direct, gp)
	}
	for _, tc := range []struct {
		name string
		a, b float64
	}{
		{"x km", direct.PositionTEMEKm.X, old.PositionTEMEKm.X}, {"y km", direct.PositionTEMEKm.Y, old.PositionTEMEKm.Y}, {"z km", direct.PositionTEMEKm.Z, old.PositionTEMEKm.Z},
		{"vx km/s", direct.VelocityTEMEKmS.X, old.VelocityTEMEKmS.X}, {"vy km/s", direct.VelocityTEMEKmS.Y, old.VelocityTEMEKmS.Y}, {"vz km/s", direct.VelocityTEMEKmS.Z, old.VelocityTEMEKmS.Z},
	} {
		if math.Abs(tc.a-tc.b) > 1e-6 {
			t.Errorf("direct and legacy %s differ: %.12g", tc.name, tc.a-tc.b)
		}
	}
}

func TestDirectPropagationReportsDecayedOrbit(t *testing.T) {
	record := elements.Record{CatalogID: "25544", Epoch: time.Date(2024, 1, 1, 0, 0, 0, 0, time.UTC), SourceFormat: "gp-json", MeanMotionRevDay: 15.5, Eccentricity: .001, InclinationDeg: 51.6, RAANDeg: 20, ArgumentOfPerigeeDeg: 30, MeanAnomalyDeg: 40, BStar: .001}
	p, err := New(record)
	if err != nil {
		t.Fatal(err)
	}
	if _, err := p.At(record.Epoch.AddDate(0, 0, 1000)); err == nil {
		t.Fatal("At() did not report SGP4 decay error")
	}
}
