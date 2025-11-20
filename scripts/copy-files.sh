#!/bin/bash

# Colores
RED='\033[0;31m'
NC='\033[0m'

runTask() {
  "$@"
  local status=$?
  if [ $status -ne 0 ]; then
    echo -e "${RED}Something went wrong while executing: $*${NC}"
    exit $status
  fi
}

# Comandos
runTask cp .env dist/backend/
