#!/bin/bash

REMOTE_NAME="$1"

if [ -z "$REMOTE_NAME" ]; then
  echo "Usage: $0 <remote-name>"
  exit 1
fi

SCRIPT=$(realpath "$0")
SCRIPTPATH=$(dirname "$SCRIPT")

ssh "${REMOTE_NAME}" "sudo apt-get update && sudo apt-get upgrade -y && sudo apt-get autoremove -y && sudo apt-get autoclean -y"
ssh "${REMOTE_NAME}" "curl -fsSL https://deno.land/install.sh | sh"
scp "${SCRIPTPATH}/dashboard.service" "${REMOTE_NAME}:/etc/systemd/system/dashboard.service"
scp "${SCRIPTPATH}/labwc.autostart" "${REMOTE_NAME}:/etc/xdg/labwc/autostart"
pushd "${SCRIPTPATH}/.."
./deploy.sh "${REMOTE_NAME}"
popd
