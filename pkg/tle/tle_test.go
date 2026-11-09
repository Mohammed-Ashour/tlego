package tle

import (
	"os"
	"strings"
	"testing"

	"github.com/Mohammed-Ashour/khonsu/internal/elements"
	utils "github.com/Mohammed-Ashour/khonsu/pkg/utils"
)

const sampleTLE = `STARLINK-1039
1 44744U 19074AH  25018.17797797  .00031028  00000+0  20924-2 0  9996
2 44744  53.0542 291.9231 0001291  91.3884 268.7253 15.06407194285563`

func TestParseTLE(t *testing.T) {
	lines := strings.Split(sampleTLE, "\n")

	tle, err := ParseTLE(lines[1], lines[2], lines[0])

	if err != nil {
		t.Errorf("ParseTLE failed: %v", err)
	}

	tests := []struct {
		name     string
		got      string
		expected string
	}{
		{"Satellite Name", tle.Name, "STARLINK-1039"},
		{"Satellite ID", tle.Line1.SataliteID, "44744"},
		{"Inclination", tle.Line2.Inclination, "53.0542"},
		{"Mean Motion", tle.Line2.MeanMotion, "15.06407194"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if tt.got != tt.expected {
				t.Errorf("got %v, want %v", tt.got, tt.expected)
			}
		})
	}
}

func TestReadTLEFile(t *testing.T) {
	// Create temporary file with sample TLE
	tmpfile, err := os.CreateTemp("", "tle_test")
	if err != nil {
		t.Fatal(err)
	}
	defer os.Remove(tmpfile.Name())

	if _, err := tmpfile.WriteString(sampleTLE); err != nil {
		t.Fatal(err)
	}
	tmpfile.Close()

	// Test file reading
	tles, err := ReadTLEFile(tmpfile.Name())
	if err != nil {
		t.Errorf("ReadTLEFile failed: %v", err)
	}

	if len(tles) != 1 {
		t.Errorf("Expected 1 TLE, got %d", len(tles))
	}

	if tles[0].Name != "STARLINK-1039" {
		t.Errorf("Expected satellite name STARLINK-1039, got %s", tles[0].Name)
	}
}

func TestChecksum(t *testing.T) {
	tests := []struct {
		name  string
		line  string
		valid bool
	}{
		{"Valid Line 1", "1 44744U 19074AH  25018.17797797  .00031028  00000+0  20924-2 0  9996", true},
		{"Valid Line 2", "2 44744  53.0542 291.9231 0001291  91.3884 268.7253 15.06407194285563", true},
		{"Invalid Line", "1 44744U 19074AH  25018.17797797  .00031028  00000+0  20924-2 0  9995", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			isValid := utils.VerifyChecksum(tt.line)
			if isValid != tt.valid {
				t.Errorf("Checksum validation for %s: got %v, want %v", tt.name, isValid, tt.valid)
			}
		})
	}
}

func TestInvalidTLE(t *testing.T) {
	tests := []struct {
		name    string
		line1   string
		line2   string
		wantErr bool
	}{
		{
			"Empty Lines",
			"",
			"",
			true,
		},
		{
			"Invalid Line Length",
			"1 44744U",
			"2 44744",
			true,
		},
		{
			"Invalid Line Numbers",
			"3 44744U 19074AH  25018.17797797  .00031028  00000+0  20924-2 0  9996",
			"4 44744  53.0542 291.9231 0001291  91.3884 268.7253 15.06407194285563",
			true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			_, err := ParseTLE("TEST", tt.line1, tt.line2)
			if (err != nil) != tt.wantErr {
				t.Errorf("ParseTLE() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func TestMalformedInputNeverPanicsAndValidInputMatchesSharedParser(t *testing.T) {
	lines := strings.Split(sampleTLE, "\n")
	mutate := func(s string, start, end int, value string) string { return s[:start] + value + s[end:] }
	tests := []struct {
		name, line1, line2 string
		publicErr          bool
	}{
		{"valid", lines[1], lines[2], false},
		{"short line 1", "1 ", lines[2], true},
		{"short line 2", lines[1], "2 ", true},
		{"missing ID", mutate(lines[1], 2, 7, "     "), lines[2], false},
		{"mismatched IDs", lines[1], mutate(lines[2], 2, 7, "12345"), false},
		{"bad epoch", mutate(lines[1], 20, 23, "000"), lines[2], false},
		{"zero mean motion", lines[1], mutate(lines[2], 52, 63, " 0.00000000"), false},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			shared, sharedErr := elements.ParseTLE([]byte(tt.line1+"\n"+tt.line2), "")
			public, publicErr := ParseTLE(tt.line1, tt.line2, "NAME")
			if (publicErr != nil) != tt.publicErr {
				t.Fatalf("public error = %v, want error %t", publicErr, tt.publicErr)
			}
			if (sharedErr == nil) != (tt.name == "valid") {
				t.Fatalf("shared error = %v", sharedErr)
			}
			if sharedErr == nil && (public.Line1.LineString != shared[0].Line1.LineString || public.Line2.LineString != shared[0].Line2.LineString || public.Line2.MeanMotion != shared[0].Line2.MeanMotion) {
				t.Fatalf("parsed lines differ: %#v and %#v", public, shared[0])
			}
		})
	}
}

func TestPublicParsersKeepLegacyAcceptance(t *testing.T) {
	lines := strings.Split(sampleTLE, "\n")
	if _, err := ParseTLE(lines[1]+"\r", lines[2]+"\r", "CRLF"); err != nil {
		t.Errorf("CRLF-split pair: %v", err)
	}
	alpha := "A5544" + lines[1][7:]
	if _, err := ReadTLELine1(lines[1][:2] + alpha); err != nil {
		t.Errorf("Alpha-5 line 1: %v", err)
	}
	if _, err := ReadTLELine1("1 "); err == nil || !strings.Contains(err.Error(), "too short") {
		t.Errorf("short line error = %v", err)
	}
	for _, contents := range []string{"", "ONLY A NAME\n", "\n  \n", lines[1] + "\n" + lines[1]} {
		path := t.TempDir() + "/input.tle"
		if err := os.WriteFile(path, []byte(contents), 0600); err != nil {
			t.Fatal(err)
		}
		if parsed, err := ReadTLEFile(path); err != nil || len(parsed) != 0 {
			t.Errorf("ReadTLEFile(%q) = %d records, %v", contents, len(parsed), err)
		}
	}
	path := t.TempDir() + "/panics.tle"
	if err := os.WriteFile(path, []byte("2 "), 0600); err != nil {
		t.Fatal(err)
	}
	if _, err := ReadTLEFile(path); err == nil {
		t.Error("accepted a line 2 with no fields")
	}
}
