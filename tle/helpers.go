package tle

import (
	"fmt"
	"math"
	"strconv"
	"strings"
)

// Helper function to parse scientific notation in TLE format
func parseScientificNotation(value string) string {
	if len(value) == 0 {
		return "0.0"
	}

	// Handle implicit decimal point and sign in exponent
	mantissa := value[:len(value)-2]
	exponent := value[len(value)-2:]

	if !strings.Contains(mantissa, ".") {
		mantissa = mantissa[:1] + "." + mantissa[1:]
	}

	// Convert to standard scientific notation
	return mantissa + "e" + exponent
}

// Add validation function
func ValidateTLE(line1, line2 string) error {
	if len(line1) != 69 || len(line2) != 69 {
		return fmt.Errorf("invalid TLE line length")
	}

	// Verify line numbers
	if line1[0] != '1' || line2[0] != '2' {
		return fmt.Errorf("invalid line numbers")
	}

	// Verify satellite IDs match
	if line1[2:7] != line2[2:7] {
		return fmt.Errorf("satellite IDs do not match")
	}

	// Verify checksums
	if !verifyChecksum(line1) || !verifyChecksum(line2) {
		return fmt.Errorf("checksum verification failed")
	}

	return nil
}

// Calculate and verify TLE line checksum
func verifyChecksum(line string) bool {
	sum := 0
	for i := 0; i < 68; i++ {
		if line[i] == '-' {
			sum += 1
		} else if line[i] >= '0' && line[i] <= '9' {
			sum += int(line[i] - '0')
		}
	}

	checksum, err := strconv.Atoi(string(line[68]))
	if err != nil {
		return false
	}

	return checksum == (sum % 10)
}

// Helper function to normalize angles
func normalizeAngle(angle float64) float64 {
	angle = math.Mod(angle, 360)
	if angle > 180 {
		angle -= 360
	} else if angle < -180 {
		angle += 360
	}
	return angle
}
