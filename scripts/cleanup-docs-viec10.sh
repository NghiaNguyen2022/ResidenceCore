#!/usr/bin/env bash
set -euo pipefail

ROOT="$(pwd)"
mkdir -p docs/legacy-manus-v1
mkdir -p docs/archive/presentation
mkdir -p docs/worklog

echo "[Việc 10] Removing temporary TypeScript output files..."
rm -f .temp_tsc_out.txt .temp_tsc_out_utf8.txt
rm -f docs/.temp_tsc_out.txt docs/.temp_tsc_out_utf8.txt

echo "[Việc 10] Moving legacy docs if they exist..."
for f in \
  01_PROJECT_OVERVIEW.pdf \
  02_API_DOCUMENTATION.md 02_API_DOCUMENTATION.pdf \
  03_DATABASE_SCHEMA.md 03_DATABASE_SCHEMA.pdf \
  04_SETUP_DEPLOYMENT.md 04_SETUP_DEPLOYMENT.pdf \
  05_USER_MANUAL.md 05_USER_MANUAL.pdf \
  ARCHITECTURE_DIAGRAM.md
  do
  if [ -f "$f" ]; then
    git mv "$f" "docs/legacy-manus-v1/$f" 2>/dev/null || mv "$f" "docs/legacy-manus-v1/$f"
  elif [ -f "docs/$f" ]; then
    git mv "docs/$f" "docs/legacy-manus-v1/$f" 2>/dev/null || mv "docs/$f" "docs/legacy-manus-v1/$f"
  fi
done

echo "[Việc 10] Moving presentation DOCX files if they exist..."
for f in \
  "Trình-bày.docx" \
  "Trình-bày-Professional.docx" \
  "ResidenceCore-Business.docx" \
  "client/src/components/ResidenceCore-Business.docx"
  do
  if [ -f "$f" ]; then
    base="$(basename "$f")"
    git mv "$f" "docs/archive/presentation/$base" 2>/dev/null || mv "$f" "docs/archive/presentation/$base"
  fi
done

echo "[Việc 10] Checking duplicate STYLE_SYNC_RULES..."
if [ -f STYLE_SYNC_RULES.md ] && [ -f client/docs/STYLE_SYNC_RULES.md ]; then
  if cmp -s STYLE_SYNC_RULES.md client/docs/STYLE_SYNC_RULES.md; then
    git rm client/docs/STYLE_SYNC_RULES.md 2>/dev/null || rm client/docs/STYLE_SYNC_RULES.md
    echo "Removed duplicate client/docs/STYLE_SYNC_RULES.md"
  else
    echo "client/docs/STYLE_SYNC_RULES.md differs from root; kept both for manual review."
  fi
fi

echo "[Việc 10] Done. Review git status before commit."
git status --short || true
