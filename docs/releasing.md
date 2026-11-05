# Publishing a release

Pushing a tag such as `v0.3.0` runs `.github/workflows/release.yml`. It tests the code, publishes archives and checksums for Linux, macOS and Windows on amd64 and arm64, and writes the Homebrew and Scoop manifests.

```bash
git switch main && git pull --ff-only
git tag -a v0.3.0 -m "v0.3.0"
git push origin v0.3.0
```

Use `vMAJOR.MINOR.PATCH`. Go ignores other forms: `@latest` skips tags like `v1.1`.

## Package managers

Set a repository secret named `TAP_GITHUB_TOKEN` to a fine-grained token with Contents read and write access to `Mohammed-Ashour/homebrew-tap` and `Mohammed-Ashour/scoop-bucket`. The workflow then updates both on each release.

Without the secret the release still succeeds. The manifests stay in the workflow's `package-manifests` artifact and can be committed by hand: `Casks/tlego.rb` in the tap and `tlego.json` in the bucket.

## Check locally

```bash
goreleaser release --snapshot --clean --skip=publish
```
