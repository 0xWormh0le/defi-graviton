#!/bin/bash
# This script stops the execution of the docker container running the docker-photon image
# 1. Execute the docker image via './docker_run.sh'
# 2. Stop the execution via './docker_stop.sh'

# Script begin
docker ps | grep "docker-photon" | awk '{system("docker stop "$1)}'
