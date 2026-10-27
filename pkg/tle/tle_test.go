package tle

import (
	"os"
	"strings"
	"testing"

	"github.com/Mohammed-Ashour/tlego/internal/elements"
	utils "github.com/Mohammed-Ashour/tlego/pkg/utils"
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

func TestMalformedInputAndParserParity(t *testing.T) {
	lines := strings.Split(sampleTLE, "\n")
	mutate := func(s string, start, end int, value string) string { return s[:start] + value + s[end:] }
	tests := []struct {
		name, line1, line2 string
	}{
		{"valid", lines[1], lines[2]},
		{"short line 1", "1 ", lines[2]},
		{"short line 2", lines[1], "2 "},
		{"missing ID", mutate(lines[1], 2, 7, "     "), lines[2]},
		{"mismatched IDs", lines[1], mutate(lines[2], 2, 7, "12345")},
		{"bad epoch", mutate(lines[1], 20, 23, "000"), lines[2]},
		{"bad derivative", mutate(lines[1], 44, 52, " invalid"), lines[2]},
		{"bad inclination", lines[1], mutate(lines[2], 8, 16, "     NaN")},
		{"bad eccentricity", lines[1], mutate(lines[2], 26, 33, "12x4567")},
		{"bad mean motion", lines[1], mutate(lines[2], 52, 63, " 0.00000000")},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			payload := []byte(tt.line1 + "\n" + tt.line2)
			shared, sharedErr := elements.ParseTLE(payload, "")
			public, publicErr := ParseTLE(tt.line1, tt.line2, "NAME")
			if (sharedErr == nil) != (publicErr == nil) || (sharedErr == nil) != (tt.name == "valid") {
				t.Fatalf("shared error %v; public error %v", sharedErr, publicErr)
			}
			if sharedErr == nil && (public.Line1.LineString != shared[0].Line1.LineString || public.Line2.LineString != shared[0].Line2.LineString || public.Line2.MeanMotion != shared[0].Line2.MeanMotion) {
				t.Fatalf("parsed lines differ: %#v and %#v", public, shared[0])
			}
		})
	}
}

func TestReadTLEFileRejectsUnpairedLines(t *testing.T) {
	lines := strings.Split(sampleTLE, "\n")
	for _, contents := range []string{"2 ", lines[1], lines[2], lines[1] + "\n" + lines[1], ""} {
		path := t.TempDir() + "/input.tle"
		if err := os.WriteFile(path, []byte(contents), 0600); err != nil {
			t.Fatal(err)
		}
		if _, err := ReadTLEFile(path); err == nil {
			t.Fatalf("accepted %q", contents)
		}
	}
}

func TestStandaloneLinesValidateFields(t *testing.T) {
	lines := strings.Split(sampleTLE, "\n")
	if _, err := ReadTLELine1(lines[1]); err != nil {
		t.Fatal(err)
	}
	if _, err := ReadTLELine2(lines[2]); err != nil {
		t.Fatal(err)
	}
	for _, line := range []string{"1 ", strings.Replace(lines[1], "44744", "     ", 1)} {
		if _, err := ReadTLELine1(line); err == nil {
			t.Fatalf("accepted %q", line)
		}
	}
	for _, line := range []string{"2 ", strings.Replace(lines[2], "15.06407194", " 0.00000000", 1)} {
		if _, err := ReadTLELine2(line); err == nil {
			t.Fatalf("accepted %q", line)
		}
	}
}
