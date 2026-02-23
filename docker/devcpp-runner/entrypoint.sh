#!/bin/bash
set -euo pipefail

# Entry point for compile-runner container.
# Expects files mounted into /work and arguments: <source-file> <exe-path> <timeout-ms>

SOURCE=${1:-/work/main.cpp}
EXE=${2:-/work/a.out}

# Default compile command (g++)
if [[ "$SOURCE" == *.c ]]; then
  COMPILER=gcc
else
  COMPILER=g++
fi

# Compile
$COMPILER "$SOURCE" -o "$EXE" 2> /work/compile-stderr.txt 1> /work/compile-stdout.txt || true

# If compile produced an executable, run it and capture output
if [[ -x "$EXE" ]]; then
  # run with timeout if available
  if command -v timeout >/dev/null 2>&1; then
    timeout 5s "$EXE" > /work/run-stdout.txt 2> /work/run-stderr.txt || true
  else
    "$EXE" > /work/run-stdout.txt 2> /work/run-stderr.txt || true
  fi
fi

# Print outputs (exit 0)
cat /work/compile-stdout.txt 2>/dev/null || true
cat /work/compile-stderr.txt 2>/dev/null >&2 || true
cat /work/run-stdout.txt 2>/dev/null || true
cat /work/run-stderr.txt 2>/dev/null >&2 || true

exit 0
