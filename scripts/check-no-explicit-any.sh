#!/bin/sh
set -eu

files=$(find utils test scripts -type f \( -name '*.ts' -o -name '*.tsx' \) -print)
if [ -n "$files" ] && grep -En '\bany\b' $files; then
  echo 'Explicit any is not allowed in maintained TypeScript or TSX.' >&2
  exit 1
fi
