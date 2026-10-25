// Package data retains the historical TUI data API. Shared fetching and
// validation live in internal/catalog.
package data

import (
	"time"

	"github.com/Mohammed-Ashour/go-satellite-v2/pkg/tle"
	"github.com/Mohammed-Ashour/tlego/internal/catalog"
)

type Store = catalog.Store
type Group = catalog.Group
type FetchMeta = catalog.FetchMeta

func DefaultCacheDir() (string, error)                   { return catalog.DefaultCacheDir() }
func NewStore(cacheDir string, ttl time.Duration) *Store { return catalog.NewStore(cacheDir, ttl) }
func ReadLocalTLE(path string) ([]tle.TLE, error)        { return catalog.ReadLocalTLE(path) }
func ReadTLEFile(path string) ([]tle.TLE, error)         { return catalog.ReadLocalTLE(path) }
