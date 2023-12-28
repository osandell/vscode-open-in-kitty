#!/usr/bin/env bash

current_dir=$1

if [ -z "$current_dir" ]; then
    echo "No directory provided. Usage: $0 <path>"
    exit 1
fi

pid=$(ps aux | grep '/Applications/kitty.app/Contents/MacOS/kitty' | grep -v grep | awk '{print $2}')
socket_path="unix:/tmp/mykitty-$pid"

# We need to truncate the path so that it matches the path in kitty's tab
current_dir_short=$(echo $current_dir | sed 's|/Users/olof|~|')
existing_tab_id=$(kitty @ --to "$socket_path" ls | jq -r --arg title "$current_dir_short" '.[].tabs[] | select(.title==$title) | .id')

if [ -z "$existing_tab_id" ]; then
    kitty @ --to "$socket_path" launch --type=tab --cwd "$current_dir"
else
    kitty @ --to "$socket_path" focus-tab --match id:$existing_tab_id
fi

ELECTRON_RUN_AS_NODE=1 /Applications/GitKraken.app/Contents/MacOS/GitKraken /Applications/GitKraken.app/Contents/Resources/app.asar/src/main/static/cli.js -p "$current_dir"
open -a kitty
sleep 0.3
open -a kitty
