package accounts

import (
	"os"
	"runtime"
	"testing"
)

func TestSaveAndLoadKeepTheFilePrivate(t *testing.T) {
	t.Setenv("XDG_CONFIG_HOME", t.TempDir())
	if saved, err := Load(); err != nil || saved.SpaceTrack != nil {
		t.Fatalf("Load with no file = %+v, %v", saved, err)
	}
	if err := Save(Accounts{SpaceTrack: &SpaceTrack{User: "me", Password: "secret"}}); err != nil {
		t.Fatal(err)
	}
	saved, err := Load()
	if err != nil || saved.SpaceTrack == nil || saved.SpaceTrack.User != "me" || saved.SpaceTrack.Password != "secret" {
		t.Fatalf("Load = %+v, %v", saved, err)
	}
	path, _ := Path()
	info, err := os.Stat(path)
	if err != nil {
		t.Fatal(err)
	}
	if runtime.GOOS != "windows" && info.Mode().Perm() != 0o600 {
		t.Fatalf("mode = %v, want 0600", info.Mode().Perm())
	}
}

func TestLoadDoesNotEchoABrokenFile(t *testing.T) {
	t.Setenv("XDG_CONFIG_HOME", t.TempDir())
	if err := Save(Accounts{}); err != nil {
		t.Fatal(err)
	}
	path, _ := Path()
	if err := os.WriteFile(path, []byte("password: [secret"), 0o600); err != nil {
		t.Fatal(err)
	}
	if _, err := Load(); err == nil || err.Error() != "the accounts file is not valid YAML" {
		t.Fatalf("err = %v", err)
	}
}
