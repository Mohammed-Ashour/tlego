package extensions

import (
	"bytes"
	"embed"
	"fmt"
	"go/format"
	"os"
	"path/filepath"
	"strings"
	"text/template"
)

//go:embed templates/*/*.tmpl
var starterFiles embed.FS

// Init creates a standalone project. An existing destination is always an
// error, including an empty directory or a symlink. No external programs run.
func Init(name, language, directory string) (string, error) {
	if !ValidName(name) {
		return "", fmt.Errorf("invalid extension name %q: use an ASCII letter followed by letters, digits or hyphens", name)
	}
	if language != "go" && language != "python" {
		return "", fmt.Errorf("unsupported language %q: choose go or python", language)
	}
	if directory == "" {
		directory = "tlego-" + name
	}
	target, err := filepath.Abs(directory)
	if err != nil {
		return "", err
	}
	entries, err := starterFiles.ReadDir("templates/" + language)
	if err != nil {
		return "", err
	}
	data := struct{ Name, Command, Module string }{name, "tlego-" + name, "tlego_" + strings.ReplaceAll(strings.ToLower(name), "-", "_")}
	files := make(map[string][]byte, len(entries))
	for _, entry := range entries {
		filename := strings.TrimSuffix(entry.Name(), ".tmpl")
		if filename == "extension.py" {
			filename = data.Module + ".py"
		}
		content, err := starterFiles.ReadFile("templates/" + language + "/" + entry.Name())
		if err != nil {
			return "", err
		}
		tmpl, err := template.New(filename).Parse(string(content))
		if err != nil {
			return "", err
		}
		var rendered bytes.Buffer
		if err := tmpl.Execute(&rendered, data); err != nil {
			return "", err
		}
		result := rendered.Bytes()
		if strings.HasSuffix(filename, ".go") {
			result, err = format.Source(result)
			if err != nil {
				return "", fmt.Errorf("format starter %s: %w", filename, err)
			}
		}
		files[filename] = result
	}
	// Mkdir is exclusive, so neither existing projects nor symlinks are replaced.
	if err := os.Mkdir(target, 0755); err != nil {
		return "", fmt.Errorf("create extension directory: %w", err)
	}
	completed := false
	var created []string
	defer func() {
		if !completed {
			for _, path := range created {
				_ = os.Remove(path)
			}
			_ = os.Remove(target)
		}
	}()
	for filename, content := range files {
		path := filepath.Join(target, filename)
		f, err := os.OpenFile(path, os.O_WRONLY|os.O_CREATE|os.O_EXCL, 0644)
		if err != nil {
			return "", err
		}
		created = append(created, path)
		_, writeErr := f.Write(content)
		closeErr := f.Close()
		if writeErr != nil {
			return "", writeErr
		}
		if closeErr != nil {
			return "", closeErr
		}
	}
	completed = true
	return target, nil
}
