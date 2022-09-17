#!/bin/bash
# This script runs the docker container built by the other script
# 1. Build the docker container with command './docker_build.sh'
# 2. Execute this script via './docker_run.sh'
# 3. Stop the execution via 'docker stop docker-photon'

# Script begin
docker run -v ${PWD}:/photon -v /photon/node_modules -p 3001:3000 --rm docker-photon
