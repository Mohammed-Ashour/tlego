package locate

import (
	"fmt"
	"math"
	"time"

	"github.com/Mohammed-Ashour/tlego/pkg/logger"
	sat "github.com/Mohammed-Ashour/tlego/pkg/sgp4"
	"github.com/Mohammed-Ashour/tlego/pkg/tle"
	utils "github.com/Mohammed-Ashour/tlego/pkg/utils"
)

// This package is responsible to draw 1 frame of the satalite location using 1 tle
func CalculatePositionECI(s sat.Satellite, t time.Time) (position [3]float64, velocity [3]float64, err error) {
	defer func() {
		if r := recover(); r != nil {
			err = fmt.Errorf("calculation error: %v", r)
			logger.Error("Calculation panic recovered", "error", r)
		}
	}()

	// Get the time difference between the input time and the TLE epoch time.
	month, day, hour, min, sec := utils.Days2mdhms(s.EpochYr, s.EpochDays)
	tleTime := time.Date(2000+int(s.EpochYr), time.Month(month), day, hour, min, int(sec), 0, time.UTC)
	tUTC := t.UTC()
	timeDiff := tUTC.Sub(tleTime)

	// Don't allow calculations too far from epoch.
	maxPropagationDays := 30.0 // Maximum days to propagate
	if math.Abs(timeDiff.Hours()/24) > maxPropagationDays {
		err = fmt.Errorf("time too far from epoch: %.2f days", timeDiff.Hours()/24)
		logger.Error("Time out of range",
			"days_from_epoch", timeDiff.Hours()/24,
			"max_days", maxPropagationDays)
		return position, velocity, err
	}

	// Convert the time difference to minutes.
	diffInMins := timeDiff.Minutes()

	// Calculate the ECI position and velocity using the SGP4 model.
	position, velocity, err = sat.Sgp4(&s, diffInMins)
	if err != nil {
		logger.Error("SGP4 calculation failed", "error", err)
		return position, velocity, err
	}

	return position, velocity, nil
}

// CalculatePositionLLA converts Earth Centered Inertial coordinates into equivalent latitude, longitude, and altitude.
func CalculatePositionLLA(s sat.Satellite, time time.Time) (latitude, longitude float64, altitude float64, err error) {
	defer func() {
		if r := recover(); r != nil {
			err = fmt.Errorf("calculation error: %v", r)
			logger.Error("LLA Calculation panic recovered", "error", r) // Log LLA specific panics
		}
	}()

	// Calculate the ECI position.
	position, _, err := CalculatePositionECI(s, time)
	if err != nil {
		return 0, 0, 0, err
	}

	// Calculate the Julian date and fraction.
	jdate, jdFrac := sat.Jday(time.Year(),
		int(time.Month()),
		time.Day(),
		time.Hour(),
		time.Minute(),
		float64(time.Second()))
	if jdate == 0 && jdFrac == 0 {
		return 0, 0, 0, fmt.Errorf("invalid date/time values")
	}

	// Calculate the Greenwich Mean Sidereal Time (GMST).
	gmst := sat.Gstime(jdate + jdFrac)

	// Convert the ECI position to LLA.
	altitude, _, latlon := utils.ECIToLLA(position, gmst)
	latitude = latlon[0]
	longitude = latlon[1]

	// Convert latitude and longitude to degrees.
	latitude = latitude * 180 / math.Pi
	longitude = longitude * 180 / math.Pi

	// Normalize longitude to [-180, 180]
	longitude = math.Mod(longitude+180, 360) - 180

	// Validate results
	if math.IsNaN(latitude) || math.IsNaN(longitude) || math.IsNaN(altitude) {
		return 0, 0, 0, fmt.Errorf("latitude, longitude, or altitude is NaN")
	}

	if latitude < -90.001 || latitude > 90.001 {
		return 0, 0, 0, fmt.Errorf("invalid latitude: %v", latitude)
	}
	if longitude < -180.001 || longitude > 180.001 {
		return 0, 0, 0, fmt.Errorf("invalid longitude: %v", longitude)
	}

	return latitude, longitude, altitude, nil
}

func GetGoogleMapsURL(t tle.TLE, s sat.Satellite, time time.Time) (string, error) {
	latitude, longitude, _, err := CalculatePositionLLA(s, time)
	if err != nil {
		logger.Error(err.Error())
		return "", err
	}

	return fmt.Sprintf("https://www.google.com/maps/?q=%.6f,%.6f", latitude, longitude), nil
}

func GetOpenStreetMapURL(t tle.TLE, s sat.Satellite, time time.Time) (string, error) {
	latitude, longitude, _, err := CalculatePositionLLA(s, time)
	if err != nil {
		fmt.Println(err)
		return "", err
	}

	return fmt.Sprintf("http://www.openstreetmap.org/?mlat=%.6f&mlon=%.6f&zoom=12", latitude, longitude), nil
}
