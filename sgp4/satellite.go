package sgp4

import (
	tle "go_tle/tle"
	"log"
	"math"
	"strconv"
)

type Satellite struct {
	// Main satellite parameters
	WhichConst    int // SGP4.wgs72
	SatNum        string
	EpochYr       int64
	EpochTynumrev int
	Error         int
	OperationMode rune // a character
	Init          rune // a character
	Method        rune // a character

	// Orbital parameters
	A           float64
	Altp        float64
	Alta        float64
	EpochDays   float64
	JdsatEpoch  float64
	JdsatEpochF float64
	Nddot       float64
	Ndot        float64
	Bstar       float64
	Rcse        float64
	Inclo       float64
	Nodeo       float64
	Ecco        float64
	Argpo       float64
	Mo          float64
	NoKozai     float64

	// TLE specific variables
	Classification byte // 'U'
	IntlDesg       string
	EphType        int
	ElNum          int
	RevNum         int

	// Unkozai'd variable
	NoUnkozai float64

	// Singly averaged variables
	Am   float64
	Em   float64
	Im   float64
	Om   float64
	Om_m float64
	Mm   float64
	Nm   float64
	T    float64

	// Constant parameters
	Tumin         float64
	Mu            float64
	RadiusEarthKm float64
	Xke           float64
	J2            float64
	J3            float64
	J4            float64
	J3oj2         float64

	// Additional elements
	DiaMm      int     // RSO dia in mm
	PeriodSec  float64 // Period in seconds
	Active     int     // "Active S/C" flag (0=n, 1=y)
	NotOrbital int     // "Orbiting S/C" flag (0=n, 1=y)
	RcsM2      float64 // "RCS (m^2)" storage

	// Temporary variables
	Ep      float64
	Inclp   float64
	Nodep   float64
	Argpp   float64
	Mp      float64
	Isimp   int
	Aycof   float64
	Con41   float64
	Cc1     float64
	Cc4     float64
	Cc5     float64
	D2      float64
	D3      float64
	D4      float64
	Delmo   float64
	Eta     float64
	Argpdot float64
	Omgcof  float64
	Sinmao  float64
	T2cof   float64
	T3cof   float64
	T4cof   float64
	T5cof   float64
	X1mth2  float64
	X7thm1  float64
	Mdot    float64
	Nodedot float64
	Xlcof   float64
	Xmcof   float64
	Nodecf  float64

	// Deep space variables
	Irez   int
	D2201  float64
	D2211  float64
	D3210  float64
	D3222  float64
	D4410  float64
	D4422  float64
	D5220  float64
	D5232  float64
	D5421  float64
	D5433  float64
	Dedt   float64
	Del1   float64
	Del2   float64
	Del3   float64
	Didt   float64
	Dmdt   float64
	Dnodt  float64
	Domdt  float64
	E3     float64
	Ee2    float64
	Peo    float64
	Pgho   float64
	Pho    float64
	Pinco  float64
	Plo    float64
	Se2    float64
	Se3    float64
	Sgh2   float64
	Sgh3   float64
	Sgh4   float64
	Sh2    float64
	Sh3    float64
	Si2    float64
	Si3    float64
	Sl2    float64
	Sl3    float64
	Sl4    float64
	Gsto   float64
	Xfact  float64
	Xgh2   float64
	Xgh3   float64
	Xgh4   float64
	Xh2    float64
	Xh3    float64
	Xi2    float64
	Xi3    float64
	Xl2    float64
	Xl3    float64
	Xl4    float64
	Xlamo  float64
	Zmol   float64
	Zmos   float64
	Atime  float64
	Xli    float64
	Xni    float64
	Snodm  float64
	Cnodm  float64
	Sinim  float64
	Cosim  float64
	Sinomm float64
	Cosomm float64
	Day    float64
	Emsq   float64
	Gam    float64
	Rtemsq float64
	S1     float64
	S2     float64
	S3     float64
	S4     float64
	S5     float64
	S6     float64
	S7     float64
	Ss1    float64
	Ss2    float64
	Ss3    float64
	Ss4    float64
	Ss5    float64
	Ss6    float64
	Ss7    float64
	Sz1    float64
	Sz2    float64
	Sz3    float64
	Sz11   float64
	Sz12   float64
	Sz13   float64
	Sz21   float64
	Sz22   float64
	Sz23   float64
	Sz31   float64
	Sz32   float64
	Sz33   float64
	Z1     float64
	Z2     float64
	Z3     float64
	Z11    float64
	Z12    float64
	Z13    float64
	Z21    float64
	Z22    float64
	Z23    float64
	Z31    float64
	Z32    float64
	Z33    float64
	Argpm  float64
	Inclm  float64
	Nodem  float64
	Dndt   float64
	Eccsq  float64

	// For initl
	Ainv   float64
	Ao     float64
	Con42  float64
	Cosio  float64
	Cosio2 float64
	Omeosq float64
	Posq   float64
	Rp     float64
	Rteosq float64
	Sinio  float64
}

// NewElsetRec creates a new ElsetRec with default values
func NewSatellite() *Satellite {
	return &Satellite{
		WhichConst: 2, // SGP4.wgs72
		// All other fields will be initialized to their zero values
	}
}

func NewSatelliteFromTLE(tle tle.TLE) Satellite {
	sat := NewSatellite()
	sat.Error = 0
	SetGravConst(Wgs84, sat)
	sat.SatNum = tle.Line1.SataliteID
	sat.EpochYr = parseInt(tle.Line1.EpochYear)
	sat.EpochDays = parseFloat(tle.Line1.EpochDay)
	sat.Ndot = parseFloat(tle.Line1.FirstDerivative) / (Xpdotp * 1440.0)
	sat.Nddot = parseFloat(tle.Line1.SecondDerivative) / (Xpdotp * 1440.0 * 1440)
	sat.Bstar = parseFloat(tle.Line1.Bstar)
	sat.Inclo = parseFloat(tle.Line2.Inclination) * deg2Rad
	sat.Nodeo = parseFloat(tle.Line2.RightAscension) * deg2Rad
	sat.Ecco = parseFloat(tle.Line2.Eccentricity)
	sat.Argpo = parseFloat(tle.Line2.ArgumentOfPerigee) * deg2Rad
	sat.Mo = parseFloat(tle.Line2.MeanAnomaly) * deg2Rad
	sat.NoKozai = parseFloat(tle.Line2.MeanMotion)

	opsmode := 'i'

	var year int64 = 0
	if sat.EpochYr < 57 {
		year = sat.EpochYr + 2000
	} else {
		year = sat.EpochYr + 1900
	}

	mon, day, hr, min, sec := Days2mdhms(year, sat.EpochDays)

	sat.JdsatEpoch, _ = Jday(int(year), int(mon), int(day), int(hr), int(min), sec)

	sgp4init(opsmode, sat)

	return *sat
}

// Days2mdhms converts a float point number of days in a year into date and time components
func Days2mdhms(year int64, days float64) (month, day, hour, minute int, second float64) {
	// Split days into whole and fractional parts
	whole := math.Floor(days)
	fraction := days - whole

	// Check if it's a leap year
	isLeap := year%400 == 0 || (year%4 == 0 && year%100 != 0)

	// Convert day of year to month and day
	month, day = tle.DayOfYearToMonthDay(int(whole), isLeap)

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

// Parses a string into a float64 value.
func parseFloat(strIn string) (ret float64) {
	ret, err := strconv.ParseFloat(strIn, 64)
	if err != nil {
		log.Fatal(err)
	}
	return ret
}

// Parses a string into a int64 value.
func parseInt(strIn string) (ret int64) {
	ret, err := strconv.ParseInt(strIn, 10, 0)
	if err != nil {
		log.Fatal(err)
	}
	return ret
}
