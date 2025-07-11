package server

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/Mohammed-Ashour/go-satellite-v2/pkg/satellite"
	"github.com/Mohammed-Ashour/tlego/pkg/celestrak"
	"github.com/Mohammed-Ashour/tlego/pkg/logger"
)

// Satellite represents a simple satellite model
type Satellite struct {
	Name    string `json:"name"`
	NORADID string `json:"norad_id"`
}

// listSatellitesHandler provides a list of satellites
// /api/satellite-groups returns a list of group names
func listGroupsHandler(w http.ResponseWriter, r *http.Request) {
	config, err := celestrak.ReadCelestrakConfig()
	if err != nil {
		http.Error(w, "Unable to load celestrak config", http.StatusInternalServerError)
		return
	}
	groups := make([]string, 0, len(config.SatelliteGroups))
	for _, group := range config.SatelliteGroups {
		groups = append(groups, group.Name)
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(groups)
}

// /api/satellites?group=GROUP_NAME returns satellites for a specific group
func listSatellitesHandler(w http.ResponseWriter, r *http.Request) {
	config, err := celestrak.ReadCelestrakConfig()
	if err != nil {
		http.Error(w, "Unable to load celestrak config", http.StatusInternalServerError)
		return
	}
	groupName := r.URL.Query().Get("group")
	if groupName == "" {
		http.Error(w, "Missing group parameter", http.StatusBadRequest)
		return
	}
	tles, err := celestrak.GetSatelliteGroupTLEs(groupName, config)
	if err != nil {
		http.Error(w, "Unable to load satellites", http.StatusInternalServerError)
		return
	}
	satellites := make([]Satellite, 0, len(tles))
	for _, t := range tles {
		satellites = append(satellites, Satellite{
			Name:    t.Name,
			NORADID: t.NoradID,
		})
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(satellites)
}

// locationHandler provides the location of a satellite
func locationHandler(w http.ResponseWriter, r *http.Request) {
	noradID := r.URL.Query().Get("norad_id")
	fmt.Println("Received NORAD ID:", noradID)
	if noradID == "" {
		http.Error(w, "Missing NORAD ID", http.StatusBadRequest)
		return
	}

	tleData, err := celestrak.GetSatelliteTLEByNoradID(noradID)
	if err != nil {
		http.Error(w, "Unable to fetch TLE data", http.StatusInternalServerError)
		return
	}

	// Initialize satellite
	now := time.Now()
	sat := satellite.TLEToSat(tleData.Line1.LineString, tleData.Line2.LineString, satellite.GravityWGS84)

	// Get position in ECI coordinates
	pos, _ := satellite.Propagate(sat, now.Year(), int(now.Month()), now.Day(),
		now.Hour(), now.Minute(), int(now.Second()))

	// Get lat/lon/alt for display info

	lat, lon, alt, _ := sat.Locate(now)

	logger.Info("[locationHandler] NORAD: %s\n", "norad_id", noradID)
	logger.Info("[locationHandler] Name: %s\n", "name", tleData.Name)
	logger.Info("[locationHandler] Position ECI (X,Y,Z): %v, %v, %v\n", "eci", pos.X, pos.Y, pos.Z)
	logger.Info("[locationHandler] LatLon: %v, %v, Alt: %v\n", "info", lat, lon, alt)

	response := map[string]interface{}{
		"name": tleData.Name,
		"eci": map[string]float64{
			"x": pos.X,
			"y": pos.Y,
			"z": pos.Z,
		},
		"info": map[string]float64{
			"latitude":  lat,
			"longitude": lon,
			"altitude":  alt,
		},
		"tle": map[string]string{
			"line1": tleData.Line1.LineString,
			"line2": tleData.Line2.LineString,
		},
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// StartServer initializes and starts the API server
func StartServer() {
	http.HandleFunc("/api/satellite-groups", listGroupsHandler)
	http.HandleFunc("/api/satellites", listSatellitesHandler)
	http.HandleFunc("/api/location", locationHandler)
	logger.Info("Starting server on :8080")
	http.Handle("/", http.FileServer(http.Dir("public")))
	http.ListenAndServe(":8080", nil)
}
