package data

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
}
