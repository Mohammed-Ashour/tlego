package satviz

import (
	"fmt"
	"go_tle/sgp4"
	sat "go_tle/sgp4"
	"go_tle/tle"
	"math"
	"time"
)

// This package is responsible to draw 1 frame of the satalite location using 1 tle
func CalculatePositionECI(s sat.Satellite, t time.Time) (position [3]float64, velocity [3]float64, err error) {
	defer func() {
		if r := recover(); r != nil {
			err = fmt.Errorf("calculation error: %v", r)
		}
	}()
	//get the diff between the time and the time of the tle
	month, day, hour, min, sec := sat.Days2mdhms(s.EpochYr, s.EpochDays)
	tleTime := time.Date(int(s.EpochYr), time.Month(month), day, hour, min, int(sec), 0, time.UTC)
	timeDiff := t.Sub(tleTime)
	//convert the time to minutes
	diffInMins := timeDiff.Minutes()

	position, velocity, err = sgp4.Sgp4(&s, diffInMins)
	if err != nil {
		return [3]float64{}, [3]float64{}, err
	}

	return position, velocity, nil
}

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
	jdate, _ := sat.Jday(time.Year(),
		int(time.Month()),
		time.Day(),
		time.Hour(),
		time.Minute(),
		float64(time.Second()))

	gmst := sat.Gstime(
		jdate,
	)

	latitude, longitude, altitude = tle.ECIToLLA(position, gmst)

	// Convert latitude to degrees and normalize to [-90, 90]
	latitude = math.Mod(latitude, 360)

	// Validate results

	if latitude < -90 || latitude > 90 {
		return 0, 0, [2]float64{}, fmt.Errorf("invalid latitude: %v", latitude)
	}
	if longitude < -180 || longitude > 180 {
		return 0, 0, [2]float64{}, fmt.Errorf("invalid longitude: %v", longitude)
	}

	return latitude, longitude, altitude, nil
}

func DrawOnMap(t tle.TLE, s sat.Satellite, time time.Time) error {
	latitude, longitude, _, err := CalculatePositionLLA(s, time)
	if err != nil {
		fmt.Println(err)
		return err
	}

	fmt.Printf("OpenStreetMap: http://www.openstreetmap.org/?mlat=%.6f&mlon=%.6f&zoom=12\n",
		latitude, longitude)
	fmt.Printf("Google Maps: https://www.google.com/maps/?q=%.6f,%.6f\n",
		latitude, longitude)
	return nil
}
