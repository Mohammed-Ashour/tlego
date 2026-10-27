package tle

import (
	"fmt"
	"io"
	"os"
	"time"

	upstream "github.com/Mohammed-Ashour/go-satellite-v2/pkg/tle"
	"github.com/Mohammed-Ashour/tlego/internal/elements"
	utils "github.com/Mohammed-Ashour/tlego/pkg/utils"
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
}

func (t TLE) String() string {
	return fmt.Sprintf("%s\n%s\n%s", t.Name, t.Line1.LineString, t.Line2.LineString)
}
func ReadTLELine1(line string) (TLELine1, error) {
	if err := elements.ValidateTLELine1(line); err != nil {
		return TLELine1{}, err
	}
	parsed, err := upstream.ReadTLELine1(line)
	return TLELine1(parsed), err
}

func ReadTLELine2(line string) (TLELine2, error) {
	if err := elements.ValidateTLELine2(line); err != nil {
		return TLELine2{}, err
	}
	parsed, err := upstream.ReadTLELine2(line)
	return TLELine2(parsed), err
}

func adapt(parsed upstream.TLE) TLE {
	return TLE{Name: parsed.Name, NoradID: parsed.NoradID, Line1: TLELine1(parsed.Line1), Line2: TLELine2(parsed.Line2)}
}

func ParseTLE(line1, line2, name string) (TLE, error) {
	parsed, err := elements.ParseTLE([]byte(line1+"\n"+line2), "")
	if err != nil {
		return TLE{}, err
	}
	if len(parsed) != 1 || parsed[0].Line1.LineString != line1 || parsed[0].Line2.LineString != line2 {
		return TLE{}, fmt.Errorf("expected one TLE pair")
	}
	result := adapt(parsed[0])
	result.Name = name
	result.NoradID = "" // Preserve the standalone ParseTLE contract.
	return result, nil
}

func ReadTLEFile(filePath string) ([]TLE, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return nil, err
	}
	defer file.Close()
	contents, err := io.ReadAll(io.LimitReader(file, (32<<20)+1))
	if err != nil {
		return nil, err
	}
	parsed, err := elements.ParseTLE(contents, "")
	if err != nil {
		return nil, err
	}
	result := make([]TLE, len(parsed))
	for i, item := range parsed {
		result[i] = adapt(item)
	}
	return result, nil
}

func (t TLE) GetTLETime() time.Time {
	epochYear := utils.ParseInt(t.Line1.EpochYear)
	year := 2000 + epochYear
	day := utils.ParseFloat(t.Line1.EpochDay)
	month, d, hour, min, sec := utils.Days2mdhms(year, day)
	return time.Date(int(year), time.Month(month), d, hour, min, int(sec), 0, time.UTC)
}
