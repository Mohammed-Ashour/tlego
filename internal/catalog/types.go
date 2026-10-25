package catalog

import "time"

type Group struct {
	Name string
	URL  string
}

type FetchMeta struct {
	Age       time.Duration
	FromCache bool
	Stale     bool
	Warning   string
	Path      string
	Source    string
	FetchedAt time.Time
	Format    string
}
