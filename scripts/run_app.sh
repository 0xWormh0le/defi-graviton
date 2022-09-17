#!/bin/bash
# This script installs all dependencies from yarn and starts the web server
# 1. Run script via ./run_app.sh
# 2. Open url http://localhost:3000/ in browser 
# 3. Stop the script via pressing Ctrl + C to cancel the process

# Script begin
yarn install && yarn run start
