// Package sources ingests public data for display and describes where it comes
// from. Each user's own Khonsu fetches, caches and credits the data; none of it is
// bundled with the application or served to anyone else.
package sources

// Category groups sources by the question they help answer.
type Category struct {
	ID          string `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
}

// Status says whether a source is connected yet.
type Status string

const (
	StatusLive    Status = "live"
	StatusPlanned Status = "planned"
)

// Nature tells readers how much weight a value can bear.
type Nature string

const (
	NatureObserved  Nature = "observed"
	NatureForecast  Nature = "forecast"
	NatureReference Nature = "reference"
	NatureEstimated Nature = "estimated"
	NatureScheduled Nature = "scheduled"
)

// Source describes one provider and how it is credited.
type Source struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	Category string `json:"category"`
	URL      string `json:"url"`
	Credit   string `json:"credit"`
	Summary  string `json:"summary"`
	Nature   Nature `json:"nature"`
	Refresh  string `json:"refresh"`
	Status   Status `json:"status"`
}

// Group is a category with its sources, in display order.
type Group struct {
	Category
	Sources []Source `json:"sources"`
}

const (
	CategoryOrbits        = "orbits"
	CategoryMissions      = "missions"
	CategorySpaceWeather  = "space-weather"
	CategoryEarthImagery  = "earth-imagery"
	CategorySkyConditions = "sky-conditions"
	CategoryRadio         = "radio"
	CategoryLaunches      = "launches"
)

const (
	IDCelesTrak     = "celestrak-gp"
	IDSWPC          = "noaa-swpc"
	IDWikidata      = "wikidata"
	IDSatNOGS       = "satnogs"
	IDLaunchLibrary = "launch-library"
)

const (
	refreshOnDemand  = "When a satellite is opened, then kept for 30 days"
	refreshDaily     = "When a satellite is opened, then kept for a day"
	refreshQuarterly = "Every 15 minutes while in use"
	refreshHourly    = "Every hour while in use"
	refreshPlanned   = "Not connected yet"
)

var categories = []Category{
	{CategoryOrbits, "Orbits and tracking", "Where satellites are and where they will be."},
	{CategoryMissions, "Missions and operators", "What a satellite is, who runs it and when it launched."},
	{CategorySpaceWeather, "Space weather", "Solar activity that heats the upper atmosphere and changes low orbits."},
	{CategoryEarthImagery, "Earth imagery", "What satellites see of the planet."},
	{CategorySkyConditions, "Sky conditions", "Whether clouds will let you see a pass."},
	{CategoryRadio, "Radio", "What satellites transmit, and on which frequencies."},
	{CategoryLaunches, "Launches", "What is about to reach orbit."},
}

var allSources = []Source{
	{IDCelesTrak, "CelesTrak GP data", CategoryOrbits, "https://celestrak.org/NORAD/documentation/gp-data-formats.php", "Orbital data from CelesTrak", "Orbital elements for positions and passes.", NatureEstimated, "Once per update, cached", StatusLive},
	{"space-track", "Space-Track", CategoryOrbits, "https://www.space-track.org/documentation", "Orbital data from Space-Track.org", "Authoritative catalog, using your own account.", NatureEstimated, refreshPlanned, StatusPlanned},

	{IDWikidata, "Wikidata", CategoryMissions, "https://www.wikidata.org/wiki/Wikidata:Licensing", "Satellite details from Wikidata (CC0)", "Names, types, operators, countries and launch dates.", NatureReference, refreshOnDemand, StatusLive},
	{"gcat", "GCAT", CategoryMissions, "https://planet4589.org/space/gcat/web/intro/index.html", "Jonathan McDowell's General Catalog of Artificial Space Objects", "Deep historical catalog.", NatureReference, refreshPlanned, StatusPlanned},

	{IDSWPC, "NOAA Space Weather Prediction Center", CategorySpaceWeather, "https://www.swpc.noaa.gov/", "Space weather data from NOAA SWPC", "Kp index, F10.7 solar flux, storm scales and alerts.", NatureObserved, refreshQuarterly, StatusLive},
	{"celestrak-space-weather", "CelesTrak space weather", CategorySpaceWeather, "https://celestrak.org/SpaceData/", "Space weather history from CelesTrak", "Years of Kp and F10.7, to compare with orbit changes.", NatureObserved, refreshPlanned, StatusPlanned},
	{"nasa-donki", "NASA DONKI", CategorySpaceWeather, "https://ccmc.gsfc.nasa.gov/tools/DONKI/", "Space weather events from NASA CCMC DONKI (research grade)", "Flares, coronal mass ejections and storms.", NatureObserved, refreshPlanned, StatusPlanned},

	{"nasa-gibs", "NASA GIBS", CategoryEarthImagery, "https://nasa-gibs.github.io/gibs-api-docs/access-basics/", "Imagery from NASA GIBS", "Daily true-color Earth on the globe.", NatureObserved, refreshPlanned, StatusPlanned},
	{"noaa-goes", "NOAA GOES", CategoryEarthImagery, "https://registry.opendata.aws/noaa-goes/", "GOES imagery from NOAA", "Geostationary views of the Americas.", NatureObserved, refreshPlanned, StatusPlanned},
	{"himawari", "Himawari", CategoryEarthImagery, "https://registry.opendata.aws/noaa-himawari/", "Himawari imagery from JMA, via NOAA Open Data", "Geostationary views of Asia and the Pacific.", NatureObserved, refreshPlanned, StatusPlanned},
	{"earth-search", "Earth Search STAC", CategoryEarthImagery, "https://element84.com/earth-search/", "Scene search by Element 84 Earth Search", "Scenes that match a satellite's track.", NatureObserved, refreshPlanned, StatusPlanned},

	{"open-meteo", "Open-Meteo", CategorySkyConditions, "https://open-meteo.com/en/terms", "Weather data by Open-Meteo.com (CC BY 4.0)", "Cloud cover for a pass. Opt-in, because it needs your location.", NatureForecast, refreshPlanned, StatusPlanned},

	{IDSatNOGS, "SatNOGS DB", CategoryRadio, "https://db.satnogs.org/about", "Transmitter data from SatNOGS DB (CC BY-SA 4.0)", "Transmitters, frequencies and modes.", NatureReference, refreshDaily, StatusLive},

	{IDLaunchLibrary, "Launch Library 2", CategoryLaunches, "https://thespacedevs.com/llapi", "Launch data from The Space Devs", "Upcoming launches and their schedules.", NatureScheduled, refreshHourly, StatusLive},
}

// Catalog returns every source grouped by category. Callers own the result.
func Catalog() []Group {
	groups := make([]Group, 0, len(categories))
	for _, category := range categories {
		group := Group{Category: category, Sources: []Source{}}
		for _, source := range allSources {
			if source.Category == category.ID {
				group.Sources = append(group.Sources, source)
			}
		}
		groups = append(groups, group)
	}
	return groups
}

// Lookup returns a source by ID.
func Lookup(id string) (Source, bool) {
	for _, source := range allSources {
		if source.ID == id {
			return source, true
		}
	}
	return Source{}, false
}
