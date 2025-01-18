package tle

import (
	"bufio"
	"fmt"
	"os"
	"strings"
)

type TLELine1 struct {
	LineNumber       string
	SataliteID       string
	Classification   string
	LaunchYear       string
	LaunchNumber     string
	LaunchPiece      string
	EpochYear        string
	EpochDay         string
	FirstDerivative  string
	SecondDerivative string
	Bstar            string // drag term or radiation pressure term
	EphemerisType    string
	ElementSetNumber string
	Checksum         string
	LineString       string
}
type TLELine2 struct {
	LineNumber        string
	SataliteID        string
	Inclination       string // degrees
	RightAscension    string // degrees
	Eccentricity      string
	ArgumentOfPerigee string // degrees
	MeanAnomaly       string // degrees
	MeanMotion        string // revolutions per day
	RevolutionNumber  string
	Checksum          string
	LineString        string
}

/*
ISS (ZARYA)
1 25544U 98067A   08264.51782528 -.00002182  00000-0 -11606-4 0  2927
2 25544  51.6416 247.4627 0006703 130.5360 325.0288 15.72125391563537
*/
type TLE struct {
	Name    string
	NoradID string
	Line1   TLELine1
	Line2   TLELine2
	// SatallliteObject satellite.Satellite
}

func ReadTLELine1(line string) (TLELine1, error) {
	if len(line) < 69 {
		return TLELine1{}, fmt.Errorf("line 1 too short: %d chars", len(line))
	}

	tleLine1 := TLELine1{
		LineString: line,
	}

	// Fixed-width field parsing based on TLE format specification
	fields := map[string][2]int{
		"LineNumber":       {0, 1},
		"SatelliteID":      {2, 7},
		"Classification":   {7, 8},
		"LaunchYear":       {9, 11},
		"LaunchNumber":     {11, 14},
		"LaunchPiece":      {14, 17},
		"EpochYear":        {18, 20},
		"EpochDay":         {20, 32},
		"FirstDerivative":  {33, 43},
		"SecondDerivative": {44, 52},
		"Bstar":            {53, 61},
		"EphemerisType":    {62, 63},
		"ElementSetNumber": {64, 68},
		"Checksum":         {68, 69},
	}

	var err error
	for field, pos := range fields {
		value := strings.TrimSpace(line[pos[0]:pos[1]])
		switch field {
		case "SatelliteID":
			tleLine1.SataliteID = value
		case "Classification":
			tleLine1.Classification = value
		case "LaunchYear":
			tleLine1.LaunchYear = value
		case "LaunchNumber":
			tleLine1.LaunchNumber = value
		case "LaunchPiece":
			tleLine1.LaunchPiece = value
		case "EpochYear":
			tleLine1.EpochYear = value
		case "EpochDay":
			tleLine1.EpochDay = value
		case "FirstDerivative":
			tleLine1.FirstDerivative = parseScientificNotation(value)
		case "SecondDerivative":
			tleLine1.SecondDerivative = parseScientificNotation(value)
		case "Bstar":
			tleLine1.Bstar = parseScientificNotation(value)
		case "EphemerisType":
			tleLine1.EphemerisType = value
		case "ElementSetNumber":
			tleLine1.ElementSetNumber = value
		case "Checksum":
			tleLine1.Checksum = value
		}
	}

	return tleLine1, err
}

func ReadTLELine2(line string) (TLELine2, error) {
	if len(line) < 69 {
		return TLELine2{}, fmt.Errorf("line 2 too short: %d chars", len(line))
	}

	tleLine2 := TLELine2{
		LineString: line,
	}

	// Fixed-width field parsing based on TLE format specification
	fields := map[string][2]int{
		"LineNumber":        {0, 1},
		"SatelliteID":       {2, 7},
		"Inclination":       {8, 16},
		"RightAscension":    {17, 25},
		"Eccentricity":      {26, 33},
		"ArgumentOfPerigee": {34, 42},
		"MeanAnomaly":       {43, 51},
		"MeanMotion":        {52, 63},
		"RevolutionNumber":  {63, 68},
		"Checksum":          {68, 69},
	}

	var err error
	for field, pos := range fields {
		value := strings.TrimSpace(line[pos[0]:pos[1]])
		switch field {
		case "SatelliteID":
			tleLine2.SataliteID = value
		case "Inclination":
			tleLine2.Inclination = value
		case "RightAscension":
			tleLine2.RightAscension = value
		case "Eccentricity":
			tleLine2.Eccentricity = "0." + value // Add leading "0." for eccentricity
		case "ArgumentOfPerigee":
			tleLine2.ArgumentOfPerigee = value
		case "MeanAnomaly":
			tleLine2.MeanAnomaly = value
		case "MeanMotion":
			tleLine2.MeanMotion = value
		case "RevolutionNumber":
			tleLine2.RevolutionNumber = value
		case "Checksum":
			tleLine2.Checksum = value
		}
	}

	return tleLine2, err
}

func ReadTLEFile(filePath string) ([]TLE, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	var tles []TLE
	var currentTLE TLE

	for scanner.Scan() {
		line := scanner.Text()

		if strings.HasPrefix(line, "1 ") {
			currentTLE.Line1, err = ReadTLELine1(line)
			if err != nil {
				return nil, err
			}
		} else if strings.HasPrefix(line, "2 ") {
			components := strings.Fields(line)
			currentTLE.NoradID = components[1]
			currentTLE.Line2, err = ReadTLELine2(line)
			if err != nil {
				return nil, err
			}

			tles = append(tles, currentTLE)
			currentTLE = TLE{}
		} else {
			currentTLE.Name = line
		}

	}

	if err := scanner.Err(); err != nil {
		return nil, err
	}

	return tles, nil
}

// func (t TLE) CalculatePositionECI(time time.Time) (position satellite.Vector3, velocity satellite.Vector3, err error) {
// 	defer func() {
// 		if r := recover(); r != nil {
// 			err = fmt.Errorf("calculation error: %v", r)
// 		}
// 	}()

// 	position, velocity = satellite.Propagate(
// 		t.SatallliteObject,
// 		time.Year(),
// 		int(time.Month()),
// 		time.Day(),
// 		time.Hour(),
// 		time.Minute(),
// 		time.Second(),
// 	)
// 	return position, velocity, nil
// }

// func (t TLE) CalculatePositionLLA(time time.Time) (latitude, longitude float64, altitude satellite.LatLong, err error) {
// 	defer func() {
// 		if r := recover(); r != nil {
// 			err = fmt.Errorf("calculation error: %v", r)
// 		}
// 	}()

// 	position, _, err := t.CalculatePositionECI(time.UTC())
// 	if err != nil {
// 		return 0, 0, satellite.LatLong{}, err
// 	}

// 	gmst := satellite.GSTimeFromDate(
// 		time.Year(),
// 		int(time.Month()),
// 		time.Day(),
// 		time.Hour(),
// 		time.Minute(),
// 		time.Second(),
// 	)

// 	latitude, longitude, altitude = satellite.ECIToLLA(position, gmst)

// 	// Convert latitude to degrees and normalize to [-90, 90]
// 	latitude = math.Mod(latitude, 360)

// 	// Validate results

// 	if latitude < -90 || latitude > 90 {
// 		return 0, 0, satellite.LatLong{}, fmt.Errorf("invalid latitude: %v", latitude)
// 	}
// 	if longitude < -180 || longitude > 180 {
// 		return 0, 0, satellite.LatLong{}, fmt.Errorf("invalid longitude: %v", longitude)
// 	}

// 	return latitude, longitude, altitude, nil
// }

// func (t TLE) DrawOnMap(time time.Time) error {
// 	latitude, longitude, _, err := t.CalculatePositionLLA(time)
// 	if err != nil {
// 		fmt.Println(err)
// 		return err
// 	}

// 	fmt.Printf("OpenStreetMap: http://www.openstreetmap.org/?mlat=%.6f&mlon=%.6f&zoom=12\n",
// 		latitude, longitude)
// 	fmt.Printf("Google Maps: https://www.google.com/maps/?q=%.6f,%.6f\n",
// 		latitude, longitude)
// 	return nil
// }
