---
name: commit
description: >
  Stage and commit changes using this repo's conventional commit style.
  Inspects staged/unstaged changes, derives a message from the diff, and commits.
  Invoke with /commit [optional hint about what changed].
---

# Commit Skill

Generate and apply a git commit following this repo's commit conventions.

## Invocation

`/commit [hint]`

- `hint` — optional context (e.g. `fix dropdown`, `add gallery toolbar`) to guide message generation

## Commit Style (observed from git log)

Individual commits:
```
type: short imperative description
```

Types in use: `feat`, `fix`, `refactor`, `doc`, `chore`

Rules:
- All lowercase
- Imperative mood ("add", "fix", "update", not "added" / "adds")
- No period at end
- No Co-authored-by
- 72-char subject line limit
- Body only when change is non-obvious (use bullet `* bullet` lines)

PR merge commits use format `feat/branch-name (#N)` with bullet body — skip this format for regular commits.

## Steps

**Step 1 — Inspect state**

Run in parallel:
```bash
git status
git diff --staged
git diff          # unstaged, to know what's not staged
```

**Step 2 — Determine what to stage**

- If there are staged changes → use them as-is
- If nothing staged but unstaged changes exist → stage all relevant changed files (`git add <files>`, prefer specific files over `git add .`)
- If working tree is clean → report "Nothing to commit" and stop

**Step 3 — Generate commit message**

Based on the diff:
1. Identify the dominant change type (`feat` / `fix` / `refactor` / `doc` / `chore`)
2. Write a ≤72-char subject: `type: imperative description`
3. If multiple distinct changes exist, add bullet body lines
4. If user provided a hint, use it to sharpen the description
5. Do NOT add boilerplate, summaries, or Co-authored-by

**Step 4 — Commit**

```bash
git commit -m "$(cat <<'EOF'
type: description

* optional body bullet
EOF
)"
```

**Step 5 — Confirm**

Show the resulting commit hash and subject to the user.

## Examples

```
/commit
/commit fix album filter dropdown
/commit add masonry grid component
```

Output after commit:
```
abc1234 feat: add masonry grid layout for gallery page
```
