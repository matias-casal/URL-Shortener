#!/bin/sh
set -e

# If the first argument is 'test'
if [ "$1" = "test" ]; then
  echo "Running tests..."
  shift
  # Run Jest with any additional arguments passed to the script
  exec yarn test "$@"
elif [ "$1" = "test:coverage" ]; then
  echo "Running tests with coverage..."
  shift
  # Run Jest with coverage and any additional arguments
  exec yarn test:coverage "$@"
else
  # Otherwise, run the default command (yarn start)
  exec "$@"
fi 