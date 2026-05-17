#!/bin/bash

DIR="$1"
shift

if [ -z "$DIR" ] || [ "$#" -eq 0 ]; then
  echo "Usage: ./copy_files.sh <directory> <extension1> <extension2> ..."
  echo "Example: ./copy_files.sh ./src ts tsx"
  exit 1
fi

find_args=()

for ext in "$@"; do
  find_args+=(-name "*.$ext" -o)
done

unset 'find_args[${#find_args[@]}-1]'

find "$DIR" -type f \( "${find_args[@]}" \) | sort | while read -r file; do
  echo "===== $file ====="
  cat "$file"
  echo
  echo
done | pbcopy

echo "Copied files with extensions: $* from '$DIR' to clipboard."

