package locate

import (
	"fmt"
)

// This package is responsible to draw 1 frame of the satalite location using 1 tle

func GetGoogleMapsURL(lat float64, lon float64) string {

	return fmt.Sprintf("https://www.google.com/maps/?q=%.6f,%.6f", lat, lon)
}

func GetOpenStreetMapURL(lat float64, lon float64) string {

	return fmt.Sprintf("http://www.openstreetmap.org/?mlat=%.6f&mlon=%.6f&zoom=12", lat, lon)
}
