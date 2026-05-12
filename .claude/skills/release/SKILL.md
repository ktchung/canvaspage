---
name: release
description: >
  Create or update a GitHub release for a version tag.
  Generates release notes from commits between the tag and the previous tag.
  Invoke with /release [version] (defaults to version in package.json).
---

# Release Skill

Create or update a GitHub release with auto-generated notes from commit history.

## Invocation

`/release [version]`

- `version` — optional version string (e.g. `2.1.0`). If omitted, read from `package.json`.

## Steps

**Step 1 — Determine version**

If the user provided a version argument, use it. Otherwise read the version from `package.json`.

Prefix with `v` if not already (e.g. `2.1.0` → `v2.1.0`).

**Step 2 — Validate tag exists**

```bash
git tag -l "v<version>"
```

If the tag doesn't exist, report the error and stop.

**Step 3 — Find the previous tag**

```bash
git tag --sort=-v:refname
```

Find the tag immediately before the current one in version order. If there is no previous tag, use the root commit as the base.

**Step 4 — Collect commits**

```bash
git log <previous_tag>..<current_tag> --format="%s%n%b" --merges
```

Also include non-merge commits:
```bash
git log <previous_tag>..<current_tag> --format="%s%n%b" --no-merges
```

**Step 5 — Generate release notes**

From all commit subjects and body lines, collect lines that start with (case-insensitive):
- `feat`
- `fix`
- `build`

Format each matching line as a bullet point (`- <line>`). Remove any trailing PR references like `(#N)` from the lines if desired for cleanliness, but keep the description.

If NO lines match any of those prefixes, use a single line:
```
- Bug fixes and performance improvements
```

**Step 6 — Create or update the release**

Check if a release already exists:
```bash
gh release view "v<version>" --json tagName 2>/dev/null
```

If it exists, update:
```bash
gh release edit "v<version>" --title "v<version>" --notes "<notes>"
```

If it doesn't exist, create:
```bash
gh release create "v<version>" --title "v<version>" --notes "<notes>"
```

**Step 7 — Confirm**

Show the release URL to the user.

## Examples

```
/release
/release 2.0.0
/release v2.1.0
```

Output:
```
✓ Release v2.1.0 created: https://github.com/user/repo/releases/tag/v2.1.0

Notes:
- feat: add version banner to sidebar
- fix: reset import dialogue
```
