#!/bin/bash

REMOTE_NAME="$1"

if [ -z "$REMOTE_NAME" ]; then
  echo "Usage: $0 <remote-name>"
  exit 1
fi

deno run build
rsync -avz --delete ./ $REMOTE_NAME:dashboard/
ssh $REMOTE_NAME "sudo systemctl restart dashboard && killall chromium"
