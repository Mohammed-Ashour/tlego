package satviz

import (
	"fmt"
	"math"
	"time"

	"github.com/Mohammed-Ashour/tlego/logger"
	sat "github.com/Mohammed-Ashour/tlego/sgp4"
	"github.com/Mohammed-Ashour/tlego/tle"
	utils "github.com/Mohammed-Ashour/tlego/utils"
)

// This package is responsible to draw 1 frame of the satalite location using 1 tle
func CalculatePositionECI(s sat.Satellite, t time.Time) (position [3]float64, velocity [3]float64, err error) {
	defer func() {
		if r := recover(); r != nil {
			err = fmt.Errorf("calculation error: %v", r)
			logger.Error("Calculation panic recovered", "error", r)
		}
	}()
	//get the diff between the time and the time of the tle
	month, day, hour, min, sec := utils.Days2mdhms(s.EpochYr, s.EpochDays)
	tleTime := time.Date(2000+int(s.EpochYr), time.Month(month), day, hour, min, int(sec), 0, time.UTC)
	tUTC := t.UTC()
	timeDiff := tUTC.Sub(tleTime)

	// Don't allow calculations too far from epoch
	maxPropagationDays := 30.0 // Maximum days to propagate
	if math.Abs(timeDiff.Hours()/24) > maxPropagationDays {
		err = fmt.Errorf("time too far from epoch: %.2f days", timeDiff.Hours()/24)
		logger.Error("Time out of range",
			"days_from_epoch", timeDiff.Hours()/24,
			"max_days", maxPropagationDays)
		return position, velocity, err
	}

	//convert the time to minutes
	diffInMins := timeDiff.Minutes()
	logger.Debug("Calculating position",
		"minutes_from_epoch", diffInMins,
		"epoch_time", tleTime)

	position, velocity, err = sat.Sgp4(&s, diffInMins)
	if err != nil {
		logger.Error("SGP4 calculation failed", "error", err)
		return position, velocity, err
	}

	return position, velocity, nil
}

// CalculatePositionLLA converts Earth Centered Inertial coordinated into equivalent latitude, longitude, altitude and velocity.
func CalculatePositionLLA(s sat.Satellite, time time.Time) (latitude, longitude float64, altitude [2]float64, err error) {
	defer func() {
		if r := recover(); r != nil {
			err = fmt.Errorf("calculation error: %v", r)
		}
	}()

	position, _, err := CalculatePositionECI(s, time)
	if err != nil {
		return 0, 0, [2]float64{}, err
	}
	jdate, jdFrac := sat.Jday(time.Year(),
		int(time.Month()),
		time.Day(),
		time.Hour(),
		time.Minute(),
		float64(time.Second()))

	gmst := sat.Gstime(
		jdate + jdFrac,
	)

	latitude, longitude, altitude = utils.ECIToLLA(position, gmst)

	// Convert to degrees with proper normalization
	latitude = math.Asin(math.Sin(latitude)) * 180 / math.Pi // Ensures -90 to +90
	longitude = math.Atan2(math.Sin(longitude), math.Cos(longitude)) * 180 / math.Pi

	// Normalize longitude to [-180, 180]
	longitude = math.Mod(longitude+180, 360) - 180

	// Validate results

	if latitude < -90.001 || latitude > 90.001 {
		return 0, 0, [2]float64{}, fmt.Errorf("invalid latitude: %v", latitude)
	}
	if longitude < -180.001 || longitude > 180.001 {
		return 0, 0, [2]float64{}, fmt.Errorf("invalid longitude: %v", longitude)
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
