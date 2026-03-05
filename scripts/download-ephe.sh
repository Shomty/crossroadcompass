#!/bin/bash
# scripts/download-ephe.sh
# Downloads Swiss Ephemeris data files required by openhumandesign-library.
# Run once after cloning: bash scripts/download-ephe.sh
# Source: https://www.astro.com/ftp/swisseph/ephe/

set -e

EPHE_DIR="${EPHE_PATH:-./ephe}"
BASE_URL="https://www.astro.com/ftp/swisseph/ephe"

FILES=(
  sepl_00.se1 sepl_06.se1 sepl_12.se1 sepl_18.se1 sepl_24.se1 sepl_30.se1
  semo_00.se1 semo_06.se1 semo_12.se1 semo_18.se1 semo_24.se1 semo_30.se1
)

mkdir -p "$EPHE_DIR"

for FILE in "${FILES[@]}"; do
  TARGET="$EPHE_DIR/$FILE"
  if [ -f "$TARGET" ]; then
    echo "  skip  $FILE (already exists)"
  else
    echo "  fetch $FILE"
    curl -fsSL "$BASE_URL/$FILE" -o "$TARGET"
  fi
done

echo ""
echo "Ephemeris files ready in $EPHE_DIR"
