# AGENTS.md — Project Conventions for make-api-private

## Overview

This repository is a private fork derived from the upstream `new-api` codebase.

The purpose of this fork is private customization, including:
- product renaming
- custom branding
- custom logo and visual identity
- frontend redesign
- private deployment-specific adjustments

## Tech Stack

- Backend: Go, Gin, GORM
- Frontend: React, TypeScript, Rsbuild, Tailwind CSS
- Databases: SQLite, MySQL, PostgreSQL
- Frontend package manager: Bun preferred, npm acceptable as local fallback when environment issues block Bun

## Core Rules

### Rule 1: Preserve Architecture

Keep the existing layered backend architecture:

`router -> controller -> service -> model`

Do not collapse layers unless explicitly requested.

### Rule 2: JSON Wrapper

In Go business code, keep using `common/json.go` wrapper functions instead of direct `encoding/json` marshal/unmarshal calls.

### Rule 3: Cross-Database Compatibility

All backend database changes must remain compatible with:
- SQLite
- MySQL
- PostgreSQL

Prefer GORM abstractions over raw SQL.

### Rule 4: Frontend Branding Is Customizable

This private fork is allowed to customize:
- product name
- logos
- titles
- favicon
- page branding
- visual language
- onboarding and marketing copy

### Rule 5: Frontend Direction

For frontend redesign work:
- prefer a deliberate, modern, technology-forward visual style
- avoid generic admin boilerplate aesthetics
- preserve usability and readability
- keep mobile and desktop layouts working

### Rule 6: i18n

If user-visible frontend text is changed, keep i18n consistent with the existing frontend translation system.

### Rule 7: Safe Fork Workflow

This repository is a private fork. Changes here should not be constrained by upstream branding rules, but functional compatibility with the current codebase should be preserved unless the user asks for deeper divergence.
