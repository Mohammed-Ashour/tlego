package templates

import "embed"

//go:embed orbit.html
var FS embed.FS

// OrbitTemplate is the embedded viewer shell.
const OrbitTemplate = "orbit.html"

//go:embed viewer.css
var ViewerCSS []byte

//go:embed viewer.bundle.js
var ViewerJS []byte
