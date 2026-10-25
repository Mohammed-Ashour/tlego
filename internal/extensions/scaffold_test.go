package extensions

import (
	"bytes"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
	"testing"
)

func TestInitGoStarterBuildsAndConsumesPosition(t *testing.T) {
	target := filepath.Join(t.TempDir(), "project with spaces")
	path, err := Init("my-summary", "go", target)
	if err != nil {
		t.Fatal(err)
	}
	if path != target {
		t.Fatalf("project path=%q, want %q", path, target)
	}
	command := exec.Command("go", "test", "./...")
	command.Dir = target
	if result, err := command.CombinedOutput(); err != nil {
		t.Fatalf("generated tests: %v\n%s", err, result)
	}
	binDir := t.TempDir()
	command = exec.Command("go", "install", ".")
	command.Dir = target
	command.Env = append(os.Environ(), "GOBIN="+binDir)
	if result, err := command.CombinedOutput(); err != nil {
		t.Fatalf("generated install: %v\n%s", err, result)
	}
	binary := filepath.Join(binDir, "tlego-my-summary")
	if runtime.GOOS == "windows" {
		binary += ".exe"
	}
	command = exec.Command(binary)
	command.Stdin = strings.NewReader(`{"schema_version":"1.0","kind":"position","data":{"catalog_id":"25544","evaluated_at":"2026-10-24T05:01:11Z","latitude_deg":12.5,"longitude_deg":-45.5,"altitude_km":420,"speed_km_s":7.66},"unknown":"ignored"}`)
	result, err := command.CombinedOutput()
	if err != nil {
		t.Fatalf("generated command: %v\n%s", err, result)
	}
	if !bytes.Contains(result, []byte("Satellite 25544")) {
		t.Fatalf("unexpected summary: %s", result)
	}
}

func TestInitRefusesExistingTargetsAndInvalidOptions(t *testing.T) {
	root := t.TempDir()
	existing := filepath.Join(root, "project")
	if err := os.Mkdir(existing, 0755); err != nil {
		t.Fatal(err)
	}
	sentinel := filepath.Join(existing, "README.md")
	if err := os.WriteFile(sentinel, []byte("keep this"), 0644); err != nil {
		t.Fatal(err)
	}
	for _, tc := range []struct{ name, language, path string }{
		{"valid", "go", existing}, {"../escape", "go", filepath.Join(root, "bad-name")},
		{"valid", "ruby", filepath.Join(root, "bad-language")}, {"tlego/unsafe", "python", filepath.Join(root, "bad-python")},
	} {
		if _, err := Init(tc.name, tc.language, tc.path); err == nil {
			t.Fatalf("Init(%q,%q,%q) should fail", tc.name, tc.language, tc.path)
		}
	}
	contents, err := os.ReadFile(sentinel)
	if err != nil || string(contents) != "keep this" {
		t.Fatalf("existing file changed: %q %v", contents, err)
	}
	entries, err := os.ReadDir(root)
	if err != nil || len(entries) != 1 {
		t.Fatalf("invalid input created files: %v %v", entries, err)
	}
}

func TestInitPythonUsesConsoleScriptAndNormalizedModule(t *testing.T) {
	target := filepath.Join(t.TempDir(), "python")
	if _, err := Init("My-Summary", "python", target); err != nil {
		t.Fatal(err)
	}
	bytes, err := os.ReadFile(filepath.Join(target, "pyproject.toml"))
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(string(bytes), `tlego-My-Summary = "tlego_my_summary:main"`) {
		t.Fatalf("incorrect console script: %s", bytes)
	}
	if _, err := os.Stat(filepath.Join(target, "tlego_my_summary.py")); err != nil {
		t.Fatal(err)
	}
	// Python remains optional for Go consumers; the packaged smoke test exercises it.
}
