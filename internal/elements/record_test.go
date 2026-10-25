package elements

import (
	"strings"
	"testing"
	"time"

	"github.com/Mohammed-Ashour/go-satellite-v2/pkg/tle"
)

const gp = `{"OBJECT_NAME":"TEST SAT","NORAD_CAT_ID":25544,"EPOCH":"2024-01-02T03:04:05.123456Z","MEAN_MOTION":15.5,"ECCENTRICITY":0.001,"INCLINATION":51.6,"RA_OF_ASC_NODE":20,"ARG_OF_PERICENTER":30,"MEAN_ANOMALY":40,"BSTAR":0.0001,"MEAN_MOTION_DOT":0.00001,"MEAN_MOTION_DDOT":0}`

func TestParseGPJSONIDsAndExactEpoch(t *testing.T) {
	for _, id := range []string{"5", "25544", "999999999"} {
		t.Run(id, func(t *testing.T) {
			input := []byte(strings.Replace(gp, `25544`, id, 1))
			records, err := ParseGPJSON(input)
			if err != nil {
				t.Fatal(err)
			}
			if records[0].CatalogID != id {
				t.Fatalf("ID=%q", records[0].CatalogID)
			}
			want := time.Date(2024, 1, 2, 3, 4, 5, 123456000, time.UTC)
			if !records[0].Epoch.Equal(want) {
				t.Fatalf("epoch=%s", records[0].Epoch)
			}
			if records[0].String() != string(input) {
				t.Fatal("raw source was not preserved")
			}
		})
	}
}

func TestParseGPJSONRejectsInvalidIDsAndMetadata(t *testing.T) {
	for _, v := range []string{`1.5`, `1e3`, `true`, `0`, `"000"`, `"1234567890"`} {
		b := []byte(strings.Replace(gp, `25544`, v, 1))
		if _, err := ParseGPJSON(b); err == nil {
			t.Errorf("accepted ID %s", v)
		}
	}
	for _, field := range []string{`"CENTER_NAME":"MARS"`, `"REF_FRAME":"GCRF"`, `"TIME_SYSTEM":"TAI"`, `"MEAN_ELEMENT_THEORY":"SGP4-XP"`, `"EPHEMERIS_TYPE":2`} {
		b := []byte(gp[:len(gp)-1] + `,` + field + `}`)
		if _, err := ParseGPJSON(b); err == nil {
			t.Errorf("accepted metadata %s", field)
		}
	}
	for _, field := range []string{`"BSTAR":null`, `"MEAN_MOTION_DOT":null`, `"EPOCH":null`} {
		b := []byte(gp[:len(gp)-1] + `,` + field + `}`)
		if _, err := ParseGPJSON(b); err == nil {
			t.Errorf("accepted missing value %s", field)
		}
	}
}

func TestGPJSONOptionalNameAndTimezone(t *testing.T) {
	for _, input := range []struct{ name, epoch, wantName string }{
		{"absent name", `"EPOCH":"2024-01-02T03:04:05.123456"`, "25544"},
		{"null name", `"EPOCH":"2024-01-02T03:04:05+02:00"`, "25544"},
	} {
		b := []byte(gp)
		if input.name == "absent name" {
			b = []byte(strings.Replace(string(b), `"OBJECT_NAME":"TEST SAT",`, "", 1))
		} else {
			b = []byte(strings.Replace(string(b), `"OBJECT_NAME":"TEST SAT"`, `"OBJECT_NAME":null`, 1))
		}
		b = []byte(strings.Replace(string(b), `"EPOCH":"2024-01-02T03:04:05.123456Z"`, input.epoch, 1))
		records, err := ParseGPJSON(b)
		if err != nil {
			t.Fatalf("%s: %v", input.name, err)
		}
		if records[0].Name != input.wantName {
			t.Fatalf("name=%q", records[0].Name)
		}
		if input.name == "null name" && records[0].Epoch.Hour() != 1 {
			t.Fatalf("offset not normalized: %s", records[0].Epoch)
		}
	}
}

func TestCanonicalizesLeadingZeroIDsAndValidatesAngles(t *testing.T) {
	input := []byte(strings.Replace(gp, `25544`, `"000964"`, 1))
	records, err := ParseGPJSON(input)
	if err != nil {
		t.Fatal(err)
	}
	if records[0].CatalogID != "964" {
		t.Fatalf("ID=%q", records[0].CatalogID)
	}
	for _, field := range []string{`"RA_OF_ASC_NODE":360`, `"ARG_OF_PERICENTER":-1`, `"MEAN_ANOMALY":360`} {
		b := []byte(strings.Replace(gp, `"RA_OF_ASC_NODE":20`, field, 1))
		if _, err := ParseGPJSON(b); err == nil {
			t.Errorf("accepted angle %s", field)
		}
	}
}

func TestFromTLERejectsInvalidEpochDay(t *testing.T) {
	tlev := tle.TLE{NoradID: "00964", Line1: tle.TLELine1{EpochYear: "24", EpochDay: "NaN", FirstDerivative: "0", SecondDerivative: "0", Bstar: "0"}, Line2: tle.TLELine2{MeanMotion: "15", Eccentricity: "0", Inclination: "1", RightAscension: "0", ArgumentOfPerigee: "0", MeanAnomaly: "0"}}
	if _, err := FromTLE(tlev); err == nil {
		t.Fatal("accepted NaN epoch day")
	}
	tlev.Line1.EpochDay = "001.5"
	r, err := FromTLE(tlev)
	if err != nil {
		t.Fatal(err)
	}
	if r.CatalogID != "964" {
		t.Fatalf("ID=%q", r.CatalogID)
	}
}

func TestParseArrayAndEquivalentTLE(t *testing.T) {
	// Use a TLE-representable epoch for direct equality: its day field has
	// eight fractional digits, while GP JSON may carry finer precision.
	jsonRecord := strings.Replace(gp, ".123456Z", ".123712Z", 1)
	got, err := ParseGPJSON([]byte("[" + jsonRecord + "]"))
	if err != nil {
		t.Fatal(err)
	}
	if len(got) != 1 {
		t.Fatal(len(got))
	}
	testTLE := tle.TLE{Name: "TEST SAT", NoradID: "25544", Line1: tle.TLELine1{EpochYear: "24", EpochDay: "002.12783708", FirstDerivative: ".00001", SecondDerivative: "0", Bstar: ".0001"}, Line2: tle.TLELine2{MeanMotion: "15.5", Eccentricity: "0.001", Inclination: "51.6", RightAscension: "20", ArgumentOfPerigee: "30", MeanAnomaly: "40"}}
	from, err := FromTLE(testTLE)
	if err != nil {
		t.Fatal(err)
	}
	if !from.Epoch.Equal(got[0].Epoch) {
		t.Fatalf("TLE epoch %s JSON epoch %s", from.Epoch, got[0].Epoch)
	}
	if from.CatalogID != got[0].CatalogID || from.MeanMotionRevDay != got[0].MeanMotionRevDay || from.Eccentricity != got[0].Eccentricity || from.InclinationDeg != got[0].InclinationDeg || from.RAANDeg != got[0].RAANDeg || from.ArgumentOfPerigeeDeg != got[0].ArgumentOfPerigeeDeg || from.MeanAnomalyDeg != got[0].MeanAnomalyDeg || from.BStar != got[0].BStar || from.MeanMotionDot != got[0].MeanMotionDot || from.MeanMotionDDot != got[0].MeanMotionDDot {
		t.Fatal("normalized TLE and GP values differ")
	}
}
