
# TLEGO (Two Line Elements) [Still in progress]

A Go library for parsing and processing Two Line Elements (TLE) data and calculating satellite positions using the SGP4 propagation model.

## Overview

This library provides functionalities to:
- Parse TLE (Two Line Elements) data
- Calculate satellite positions using SGP4 propagation model
- Track satellite positions in real-time
- Convert coordinates between different reference frames


## Usage

```go
import "github.com/Mohammed-Ashour/tlego"

// Parse TLE data
tle := gotle.ParseTLE(`
STARLINK-1039           
1 44744U 19074AH  25018.17797797  .00031028  00000+0  20924-2 0  9996
2 44744  53.0542 291.9231 0001291  91.3884 268.7253 15.06407194285563
`)

// Calculate satellite position
pos, vel := tle.Position(time.Now())
```

## Features

- Full SGP4 implementation in pure Go
- High precision satellite position calculation
- Support for multiple time formats
- Thread-safe operations
- Extensible coordinate system transformations

## Documentation

TBD
## Contributing

TBD
## License

TBD