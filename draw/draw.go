package draw

import (
	"math"

	"github.com/fogleman/gg"
)

// This package is responsible to draw 1 frame of the satalite location using 1 tle

type ContextConfig struct {
	Width  int
	Height int
}

func CreateGraphContext(config ContextConfig) *gg.Context {
	// define the context of the draw
	W := config.Width  // draw width
	H := config.Height // draw height

	C := gg.NewContext(W, H)
	DrawGlobe(C, W, H)
	return C

}

func DrawDot(C *gg.Context, x float64, y float64) {
	C.SetRGB(x+y, x, y) // Red color
	dotSize := 3
	C.DrawCircle(x+1, y+1, float64(dotSize))
}

func DrawGlobe(C *gg.Context, W int, H int) {
	// Draw the globe
	C.SetRGB(0, 0, 1)

	// Draw the globe
	C.DrawCircle(float64(W)/2, float64(H)/2, float64(W)/2)

	// Fill the circle with the current color (blue)
	C.Fill()
	C.Stroke()

	//reset the color to black
	C.SetRGB(1, 0, 0)
	// Draw latitude lines
	for lat := -80; lat <= 80; lat += 20 {
		y := float64(H)/2 - float64(H)/2*float64(lat)/90
		// Calculate the x-coordinates based on the y-coordinate
		x1 := float64(W)/2 - math.Sqrt(math.Pow(float64(W)/2, 2)-math.Pow(y-float64(H)/2, 2))
		x2 := float64(W)/2 + math.Sqrt(math.Pow(float64(W)/2, 2)-math.Pow(y-float64(H)/2, 2))
		C.DrawLine(x1, y, x2, y)
		C.Stroke()
	}
	C.SetRGB(0, 0, 0)
	// Draw longitude lines
	for lon := -180; lon <= 180; lon += 20 {
		C.MoveTo(float64(W)/2, float64(H)/2)
		for lat := -90; lat <= 90; lat++ {
			x := float64(W)/2 + float64(W)/2*math.Sin(float64(lon)*math.Pi/180)*math.Cos(float64(lat)*math.Pi/180)
			y := float64(H)/2 + float64(H)/2*math.Sin(float64(lat)*math.Pi/180)
			C.LineTo(x, y)
		}
		C.Stroke()
	}

}
