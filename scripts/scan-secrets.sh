#!/usr/bin/env bash
set -euo pipefail

# Scan staged changes for common credential patterns.
# This is intentionally lightweight and fast for local hooks.

DIFF_CONTENT="$(git diff --cached -- . ':!*.lock' ':!package-lock.json' ':!pnpm-lock.yaml' ':!yarn.lock' || true)"

if [[ -z "${DIFF_CONTENT}" ]]; then
  exit 0
fi

PATTERN='(AIza[0-9A-Za-z_-]{20,}|GOCSPX-[0-9A-Za-z_-]{10,}|sk_(live|test)_[0-9A-Za-z]{10,}|AKIA[0-9A-Z]{16}|xox[baprs]-[0-9A-Za-z-]{10,}|-----BEGIN (RSA|EC|OPENSSH|PRIVATE) KEY-----|[A-Za-z0-9_]+_API_KEY\s*=\s*[^[:space:]]+|[A-Za-z0-9_]+_SECRET\s*=\s*[^[:space:]]+)'

if printf '%s' "$DIFF_CONTENT" | grep -Eiq "$PATTERN"; then
  echo ""
  echo "[SECURITY] Potential secret detected in staged changes."
  echo "Commit blocked. Rotate leaked keys and move secrets to local env files."
  echo ""
  exit 1
fi

exit 0
