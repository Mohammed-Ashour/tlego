package elements

import (
	"bufio"
	"fmt"
	"math"
	"strconv"
	"strings"

	"github.com/Mohammed-Ashour/go-satellite-v2/pkg/tle"
)

const maxTLEPayloadSize = 32 << 20

func validateTLEID(id string) error {
	if len(id) < 1 || len(id) > 9 {
		return fmt.Errorf("invalid NORAD ID %q: expected 1 to 9 decimal digits", id)
	}
	for _, r := range id {
		if r < '0' || r > '9' {
			return fmt.Errorf("invalid NORAD ID %q: expected decimal digits", id)
		}
	}
	n, _ := strconv.Atoi(id)
	if n < 1 {
		return fmt.Errorf("invalid NORAD ID %q: must be at least 1", id)
	}
	return nil
}

func ValidateTLEPayload(contents []byte, expectedNoradID string) error {
	if len(contents) > maxTLEPayloadSize {
		return fmt.Errorf("TLE input exceeds %d bytes", maxTLEPayloadSize)
	}
	if expectedNoradID != "" {
		if err := validateTLEID(expectedNoradID); err != nil {
			return err
		}
	}
	lines := strings.Split(strings.ReplaceAll(string(contents), "\r\n", "\n"), "\n")
	count := 0
	pending := false
	pendingID := ""
	for _, line := range lines {
		line = strings.TrimSuffix(line, "\r")
		if line == "" {
			continue
		}
		switch {
		case strings.HasPrefix(line, "1 "):
			if pending {
				return fmt.Errorf("invalid TLE line 1")
			}
			if err := ValidateTLELine1(line); err != nil {
				return err
			}
			pendingID = strings.TrimSpace(line[2:7])
			pending = true
		case strings.HasPrefix(line, "2 "):
			if !pending || len(line) < 69 {
				return fmt.Errorf("invalid TLE line 2")
			}
			line2ID := strings.TrimSpace(line[2:7])
			if !decimalTLEID(line[2:7]) || pendingID != line2ID {
				return fmt.Errorf("TLE line identities do not match")
			}
			if expectedNoradID != "" && canonicalNoradID(line2ID) != canonicalNoradID(expectedNoradID) {
				return fmt.Errorf("response NORAD ID %s does not match requested ID %s", line2ID, expectedNoradID)
			}
			if err := ValidateTLELine2(line); err != nil {
				return err
			}
			pending = false
			count++
		default:
			if pending {
				return fmt.Errorf("unexpected line between TLE pair")
			}
		}
	}
	if pending || count == 0 {
		return fmt.Errorf("incomplete or empty TLE payload")
	}
	return nil
}

func decimalTLEID(field string) bool {
	return validateTLEID(strings.TrimSpace(field)) == nil
}

func canonicalNoradID(id string) string {
	return strings.TrimLeft(id, "0")
}

func parseTLENumber(label, value, noradID string) (float64, error) {
	parsed, err := strconv.ParseFloat(value, 64)
	if err != nil || math.IsNaN(parsed) || math.IsInf(parsed, 0) {
		return 0, fmt.Errorf("invalid %s in TLE for NORAD ID %s", label, noradID)
	}
	return parsed, nil
}

// ValidateTLELine1 checks the fixed-width identity, epoch and numeric fields.
func ValidateTLELine1(line1 string) error {
	if len(line1) < 69 || !strings.HasPrefix(line1, "1 ") {
		return fmt.Errorf("invalid TLE line 1")
	}
	if !decimalTLEID(line1[2:7]) {
		return fmt.Errorf("invalid NORAD ID in TLE line 1")
	}
	noradID := strings.TrimSpace(line1[2:7])
	for _, field := range [][2]int{{33, 43}, {44, 52}, {53, 61}} {
		value := strings.TrimSpace(line1[field[0]:field[1]])
		if len(value) > 0 && len(value) < 3 {
			return fmt.Errorf("invalid numeric field in TLE line 1")
		}
	}
	parse := func(label, value string) (float64, error) { return parseTLENumber(label, value, noradID) }
	// Match the pinned satellite parser's exact numeric transformations so any
	// value accepted here is safe for its subsequent ParseFloat calls.
	epochYear, err := strconv.Atoi(line1[18:20])
	if err != nil {
		return fmt.Errorf("invalid epoch year for NORAD ID %s", noradID)
	}
	for _, r := range line1[18:20] {
		if r < '0' || r > '9' {
			return fmt.Errorf("invalid epoch year for NORAD ID %s", noradID)
		}
	}
	epochDay, err := parse("epoch day", line1[20:32])
	if err != nil {
		return err
	}
	if line1[23] != '.' {
		return fmt.Errorf("invalid epoch day format for NORAD ID %s", noradID)
	}
	for _, r := range line1[20:23] {
		if r < '0' || r > '9' {
			return fmt.Errorf("invalid epoch day format for NORAD ID %s", noradID)
		}
	}
	for _, r := range line1[24:32] {
		if r < '0' || r > '9' {
			return fmt.Errorf("invalid epoch day format for NORAD ID %s", noradID)
		}
	}
	fullYear := epochYear + 2000
	if epochYear >= 57 {
		fullYear = epochYear + 1900
	}
	daysInYear := 365.0
	if fullYear%400 == 0 || fullYear%4 == 0 && fullYear%100 != 0 {
		daysInYear = 366
	}
	if epochDay < 1 || epochDay >= daysInYear+1 {
		return fmt.Errorf("epoch day out of range for NORAD ID %s", noradID)
	}
	for _, field := range []struct{ label, value string }{
		{"first derivative", strings.Replace(line1[33:43], " ", "", 2)},
		{"second derivative", strings.Replace(line1[44:45]+"."+line1[45:50]+"e"+line1[50:52], " ", "", 2)},
		{"BSTAR", strings.Replace(line1[53:54]+"."+line1[54:59]+"e"+line1[59:61], " ", "", 2)},
	} {
		if _, err := parse(field.label, field.value); err != nil {
			return err
		}
	}
	return nil
}

// ValidateTLELine2 checks the fixed-width identity and orbital numeric fields.
func ValidateTLELine2(line2 string) error {
	if len(line2) < 69 || !strings.HasPrefix(line2, "2 ") {
		return fmt.Errorf("invalid TLE line 2")
	}
	if !decimalTLEID(line2[2:7]) {
		return fmt.Errorf("invalid NORAD ID in TLE line 2")
	}
	noradID := strings.TrimSpace(line2[2:7])
	parse := func(label, value string) (float64, error) { return parseTLENumber(label, value, noradID) }
	for _, field := range []struct{ label, value string }{
		{"inclination", strings.Replace(line2[8:16], " ", "", 2)},
		{"right ascension", strings.Replace(line2[17:25], " ", "", 2)},
		{"argument of perigee", strings.Replace(line2[34:42], " ", "", 2)},
		{"mean anomaly", strings.Replace(line2[43:51], " ", "", 2)},
		{"mean motion", strings.Replace(line2[52:63], " ", "", 2)},
	} {
		if _, err := parse(field.label, field.value); err != nil {
			return err
		}
	}
	for i, field := range [][2]int{{8, 16}, {17, 25}, {34, 42}, {43, 51}} {
		angle, _ := parse("angle", strings.Replace(line2[field[0]:field[1]], " ", "", 2))
		maxAngle := 360.0
		if i == 0 {
			maxAngle = 180
		}
		if angle < 0 || i == 0 && angle > maxAngle || i > 0 && angle >= maxAngle {
			return fmt.Errorf("angle out of range for NORAD ID %s", noradID)
		}
	}
	eccentricityText := line2[26:33]
	for _, r := range eccentricityText {
		if r < '0' || r > '9' {
			return fmt.Errorf("invalid eccentricity for NORAD ID %s", noradID)
		}
	}
	eccentricity, err := parse("eccentricity", "."+eccentricityText)
	if err != nil || eccentricity < 0 || eccentricity >= 1 {
		return fmt.Errorf("eccentricity out of range for NORAD ID %s", noradID)
	}
	meanMotion, err := parse("mean motion", strings.Replace(line2[52:63], " ", "", 2))
	if err != nil || meanMotion <= 0 {
		return fmt.Errorf("mean motion must be positive for NORAD ID %s", noradID)
	}
	return nil
}

// ParseTLE validates a bounded payload before invoking the legacy field parser.
func ParseTLE(contents []byte, expectedID string) (result []tle.TLE, err error) {
	if err := ValidateTLEPayload(contents, expectedID); err != nil {
		return nil, err
	}
	defer func() {
		if recover() != nil {
			result = nil
			err = fmt.Errorf("invalid TLE data: parser rejected malformed input")
		}
	}()
	scanner := bufio.NewScanner(strings.NewReader(strings.ReplaceAll(string(contents), "\r\n", "\n")))
	var current tle.TLE
	for scanner.Scan() {
		line := scanner.Text()
		switch {
		case strings.HasPrefix(line, "1 "):
			current.Line1, err = tle.ReadTLELine1(line)
			if err != nil {
				return nil, err
			}
		case strings.HasPrefix(line, "2 "):
			current.Line2, err = tle.ReadTLELine2(line)
			if err != nil {
				return nil, err
			}
			current.NoradID = strings.TrimSpace(line[2:7])
			result = append(result, current)
			current = tle.TLE{}
		case strings.TrimSpace(line) != "":
			current.Name = strings.TrimSpace(line)
		}
	}
	if err := scanner.Err(); err != nil {
		return nil, err
	}
	return result, nil
}
