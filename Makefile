.DEFAULT_GOAL := help
.PHONY: help install build setup web test test-web notices

help: ## Show these commands
	@awk 'BEGIN {FS = ":.*## "} /^[a-z-]+:.*## / {printf "  make %-10s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install the khonsu command with Go
	go install .
	@echo "Installed. If your shell cannot find khonsu, add $$(go env GOPATH)/bin to PATH."

build: ## Build bin/khonsu
	go build -o bin/khonsu .

setup: ## Step-by-step wizard for optional accounts and your location
	go run . setup

web: ## Run the web app from this checkout
	go run . web

test: ## Run the Go tests
	go test ./...

test-web: ## Run the web app tests (needs Node)
	cd internal/webui && npm test

notices: ## Regenerate THIRD_PARTY_NOTICES.md (needs npm ci in internal/webui)
	go run ./internal/tools/notices > THIRD_PARTY_NOTICES.md
