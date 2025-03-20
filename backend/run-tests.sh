#!/bin/bash
set -e

# Determine if we're using Docker
if [ "$1" = "--docker" ] || [ "$1" = "-d" ]; then
  echo "Running tests in Docker container..."
  docker compose up backend-test
else
  echo "Running tests locally..."
  cd "$(dirname "$0")"
  
  # Set environment variables for testing
  export NODE_ENV=test
  export PORT=4001
  export JWT_SECRET=test-jwt-secret
  export TEST_TYPE=unit
  
  # Run tests
  yarn test
fi

exit 0 