package templates

import "embed"

//go:embed orbit.html
var FS embed.FS

// OrbitTemplate is the name of the orbit visualization template
const OrbitTemplate = "orbit.html"
