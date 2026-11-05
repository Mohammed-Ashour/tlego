// Package webui embeds the compiled web app, so installed binaries need no Node
// toolchain and no checkout. Run npm run build here after changing src.
package webui

import (
	"embed"
	"io/fs"
)

//go:embed dist
var dist embed.FS

// FS returns the static files with index.html at the root.
func FS() fs.FS {
	files, err := fs.Sub(dist, "dist")
	if err != nil {
		panic(err) // The embed pattern above guarantees this directory exists.
	}
	return files
}
