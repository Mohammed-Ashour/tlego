package elements

import (
	"strings"
	"testing"
)

func TestParseTLEExpectedIDAndSource(t *testing.T) {
	line1 := "1 44744U 19074AH  25018.17797797  .00031028  00000+0  20924-2 0  9996"
	line2 := "2 44744  53.0542 291.9231 0001291  91.3884 268.7253 15.06407194285563"
	payload := []byte("STARLINK-1039\r\n" + line1 + "\r\n" + line2 + "\r\n")
	parsed, err := ParseTLE(payload, "000044744")
	if err != nil {
		t.Fatal(err)
	}
	if len(parsed) != 1 || parsed[0].NoradID != "44744" || parsed[0].Line1.LineString != line1 || parsed[0].Line2.LineString != line2 {
		t.Fatalf("unexpected parsed record: %#v", parsed)
	}
	if err := ValidateTLEPayload(payload, "44745"); err == nil {
		t.Fatal("accepted a different requested ID")
	}
	if err := ValidateTLEPayload(payload, "0"); err == nil {
		t.Fatal("accepted invalid requested ID")
	}
	mismatched := strings.Replace(line2, "44744", "44745", 1)
	if _, err := ParseTLE([]byte(line1+"\n"+mismatched), ""); err == nil {
		t.Fatal("accepted mismatched lines")
	}
}

func TestStandaloneLineValidationMatchesPair(t *testing.T) {
	line1 := "1 44744U 19074AH  25018.17797797  .00031028  00000+0  20924-2 0  9996"
	line2 := "2 44744  53.0542 291.9231 0001291  91.3884 268.7253 15.06407194285563"
	change := func(s string, start, end int, value string) string { return s[:start] + value + s[end:] }
	cases := []struct {
		name, first, second string
		line1Bad, line2Bad  bool
	}{
		{"valid", line1, line2, false, false},
		{"epoch year", change(line1, 18, 20, "X5"), line2, true, false},
		{"epoch day", change(line1, 20, 23, "000"), line2, true, false},
		{"non-leap year", change(line1, 20, 23, "366"), line2, true, false},
		{"first derivative", change(line1, 33, 43, "       NaN"), line2, true, false},
		{"second derivative", change(line1, 44, 52, " invalid"), line2, true, false},
		{"bstar", change(line1, 53, 61, " invalid"), line2, true, false},
		{"inclination", line1, change(line2, 8, 16, "181.0000"), false, true},
		{"eccentricity", line1, change(line2, 26, 33, "12x4567"), false, true},
		{"mean motion", line1, change(line2, 52, 63, " 0.00000000"), false, true},
		{"line 1 ID", change(line1, 2, 7, "     "), line2, true, false},
		{"line 2 ID", line1, change(line2, 2, 7, "     "), false, true},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			err1, err2 := ValidateTLELine1(tc.first), ValidateTLELine2(tc.second)
			if (err1 != nil) != tc.line1Bad || (err2 != nil) != tc.line2Bad {
				t.Fatalf("line errors = %v, %v", err1, err2)
			}
			_, err := ParseTLE([]byte(tc.first+"\n"+tc.second), "")
			if (err != nil) != (tc.line1Bad || tc.line2Bad) {
				t.Fatalf("pair error = %v", err)
			}
		})
	}
}
