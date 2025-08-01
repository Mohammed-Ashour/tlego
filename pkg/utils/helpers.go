package utils

import (
	"fmt"
	"math"
	"strconv"
	"strings"

	"github.com/Mohammed-Ashour/tlego/pkg/logger"
)

// Helper function to parse scientific notation in TLE format
func ParseScientificNotation(value string) string {
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
	if !VerifyChecksum(line1) || !VerifyChecksum(line2) {
		return fmt.Errorf("checksum verification failed")
	}

	return nil
}

// Calculate and verify TLE line checksum
func VerifyChecksum(line string) bool {
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
func NormalizeAngle(angle float64) float64 {
	angle = math.Mod(angle, 360)
	if angle > 180 {
		angle -= 360
	} else if angle < -180 {
		angle += 360
	}
	return angle
}

// dayOfYearToMonthDay converts day of year to month and day
func DayOfYearToMonthDay(dayOfYear int, isLeap bool) (month, day int) {
	// Days in each month for normal and leap years
	daysInMonth := [...]int{31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31}
	if isLeap {
		daysInMonth[1] = 29
	}

	dayCount := dayOfYear
	month = 1

	for i, days := range daysInMonth {
		if dayCount <= days {
			month = i + 1
			day = dayCount
			break
		}
		dayCount -= days
	}

	return month, day
}

// ECIToLLA converts Earth-Centered Inertial (ECI) coordinates into equivalent latitude, longitude, and altitude.
// Reference: http://celestrak.com/columns/v02n03/ and Bowring's method
func ECIToLLA(eciCoords [3]float64, gmst float64) (latitude, longitude, altitude float64) {
	// WGS84 ellipsoid constants
	a := 6378.137            // semi-major axis in km
	f := 1.0 / 298.257223563 // flattening
	b := a * (1 - f)         // semi-minor axis in km
	e2 := 1 - (b*b)/(a*a)    // first eccentricity squared

	X, Y, Z := eciCoords[0], eciCoords[1], eciCoords[2]
	logger.Info("ECI Coordinates", "X", X, "Y", Y, "Z", Z)
	logger.Info("GMST", "GMST", gmst)

	// Calculate longitude in radians, accounting for Earth's rotation via GMST
	lonRad := math.Atan2(Y, X) - gmst
	lonRad = math.Mod(lonRad+math.Pi, 2*math.Pi) - math.Pi

	// Iterative computation for latitude and altitude (Bowring's method)
	p := math.Sqrt(X*X + Y*Y)
	latRad := math.Atan2(Z, p*(1-e2))
	var latPrev float64
	for i := 0; i < 5; i++ { // 5 iterations is generally sufficient for convergence
		N := a / math.Sqrt(1-e2*math.Sin(latRad)*math.Sin(latRad))
		altitude = p/math.Cos(latRad) - N
		latPrev = latRad
		latRad = math.Atan2(Z, p*(1-e2*N/(N+altitude)))
		if math.Abs(latRad-latPrev) < 1e-12 {
			break
		}
	}

	// Convert final latitude and longitude from radians to degrees
	latitude = latRad * (180 / math.Pi)
	longitude = lonRad * (180 / math.Pi)

	return latitude, longitude, altitude
}

func ParseFloat(strIn string) (ret float64) {
	ret, err := strconv.ParseFloat(strIn, 64)
	if err != nil {
		panic(err) // Use panic for unrecoverable errors during parsing
	}
	return ret
}

// Parses a string into a int64 value.
func ParseInt(strIn string) (ret int64) {
	ret, err := strconv.ParseInt(strIn, 10, 0)
	if err != nil {
		panic(err) // Use panic for unrecoverable errors during parsing
	}
	return ret
}

// Days2mdhms converts a float point number of days in a year into date and time components
func Days2mdhms(year int64, days float64) (month, day, hour, minute int, second float64) {
	// Split days into whole and fractional parts
	whole := math.Floor(days)
	fraction := days - whole

	// Check if it's a leap year
	isLeap := year%400 == 0 || (year%4 == 0 && year%100 != 0)

	// Convert day of year to month and day
	month, day = DayOfYearToMonthDay(int(whole), isLeap)

	// Handle edge case where month becomes 13
	if month == 13 {
		month = 12
		day += 31
	}

	// Convert fractional day to hour, minute, second
	// Add half a microsecond to handle rounding
	fraction += 0.5 / 86400e6

	// Convert to seconds and break down into components
	secondsTotal := fraction * 86400.0
	minute = int(math.Floor(secondsTotal / 60.0))
	second = math.Mod(secondsTotal, 60.0)
	hour = minute / 60
	minute = minute % 60

	// Round to microseconds
	second = math.Floor(second*1e6) / 1e6

	return month, day, hour, minute, second
}
