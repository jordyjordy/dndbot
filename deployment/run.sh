#!/bin/bash
SERVERPORT=3010

help()
{
    echo "" 
    echo "Usage: $0 -s Server Port"
    exit 1
}

while getopts "s:h:" ports; do
    case "${ports}" in
        s)
            SERVERPORT=${OPTARG};;
        h) help ;;
        *) help;;
    esac
done

echo $SERVERPORT
export SERVERPORT=$SERVERPORT
docker-compose --project-name dndbot down
docker-compose pull
docker-compose --project-name dndbot up -d