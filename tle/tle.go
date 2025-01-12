package tle

import (
	"bufio"
	"os"
	"strings"
	"time"

	"github.com/joshuaferrara/go-satellite"
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
	Name             string
	NoradID          string
	Line1            TLELine1
	Line2            TLELine2
	SatallliteObject satellite.Satellite
}

func ReadTLELine1(line string) (TLELine1, error) {
	// Example: 1 25544U 98067A   08264.51782528 -.00002182  00000-0 -11606-4 0  2927

	//parse the line
	//split the line into its components

	components := strings.Fields(line)
	TleLine1 := TLELine1{}
	TleLine1.LineString = line
	TleLine1.LineNumber = components[0]
	TleLine1.SataliteID = components[1][0:5]
	TleLine1.Classification = components[1][5:6]
	TleLine1.LaunchYear = components[2][0:2]
	TleLine1.LaunchNumber = components[2][2:5]
	TleLine1.LaunchPiece = components[2][5:len(components[2])]
	TleLine1.EpochYear = components[3][0:2]
	TleLine1.EpochDay = components[3][2:14]
	TleLine1.FirstDerivative = components[4][0:1] + "e" + components[4][1:8]
	if components[5][0:1] == "-" {
		TleLine1.SecondDerivative = components[5][0:1] + "e" + components[5][1:8]
	} else {
		TleLine1.SecondDerivative = "0." + components[5][0:len(components[5])]
	}
	TleLine1.Bstar = components[6][0:1] + "e" + components[6][1:8]
	TleLine1.EphemerisType = components[7][0:1]
	TleLine1.ElementSetNumber = components[8][0:4]
	TleLine1.Checksum = components[8][4:len(components[8])]
	return TleLine1, nil
	//convert the components to their respective types

	//return the parsed line
}
func ReadTLELine2(line string) (TLELine2, error) {
	// Example: 2 25544  51.6416 247.4627 0006703 130.5360 325.0288 15.72125391563537

	//parse the line
	//split the line into its components
	components := strings.Fields(line)
	TleLine2 := TLELine2{}
	TleLine2.LineString = line
	TleLine2.LineNumber = components[0]
	TleLine2.SataliteID = components[1]
	TleLine2.Inclination = components[2]
	TleLine2.RightAscension = components[3]
	TleLine2.Eccentricity = "0." + components[4]
	TleLine2.ArgumentOfPerigee = components[5]
	TleLine2.MeanAnomaly = components[6]
	TleLine2.MeanMotion = components[7][0:11]
	TleLine2.RevolutionNumber = components[7][11:16]
	TleLine2.Checksum = components[7][16:17]
	return TleLine2, nil

	//return the parsed line
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
			currentTLE.SatallliteObject = satellite.TLEToSat(currentTLE.Line1.LineString, currentTLE.Line2.LineString, "wgs84")

			tles = append(tles, currentTLE)
			// t, _ := json.MarshalIndent(currentTLE, "", "  ")
			// fmt.Println(string(t))
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

func (t TLE) CalculatePositionECI(time time.Time) (position satellite.Vector3, velocity satellite.Vector3) {
	// SGP4
	position, velocity = satellite.Propagate(t.SatallliteObject, time.Year(), int(time.Month()), time.Day(), time.Hour(), time.Minute(), time.Second())
	return position, velocity
}

func (t TLE) CalculatePositionLLA(time time.Time) (latitude float64, longitude float64, altitude satellite.LatLong) {
	// SGP4
	gmst := satellite.GSTimeFromDate(time.Year(), int(time.Month()), time.Day(), time.Hour(), time.Minute(), time.Second())
	position, _ := t.CalculatePositionECI(time)
	latitude, longitude, altitude = satellite.ECIToLLA(position, gmst)
	return latitude, longitude, altitude

}
