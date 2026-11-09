package feed

// Category groups sources by the question they help answer.
type Category struct {
	ID          string `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
}

// Status says whether a source is connected yet.
type Status string

const (
	StatusLive Status = "live"
	// StatusSetup means the source works once the user supplies an account.
	StatusSetup Status = "setup"
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

// Info describes one provider and how it is credited.
type Info struct {
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

const (
	CategoryOrbits        = "orbits"
	CategoryMissions      = "missions"
	CategorySpaceWeather  = "space-weather"
	CategoryEarthImagery  = "earth-imagery"
	CategorySkyConditions = "sky-conditions"
	CategoryRadio         = "radio"
	CategoryLaunches      = "launches"
)
