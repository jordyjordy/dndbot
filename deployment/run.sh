#!/bin/bash
CLIENTPORT=8080
SERVERPORT=5000

help()
{
    echo "" 
    echo "Usage: $0 -c Client port, -s Server Port"
    exit 1
}

while getopts "c:s:h:" ports; do
    case "${ports}" in
        c)
            CLIENTPORT=${OPTARG};;
        s)
            SERVERPORT=${OPTARG};;
        h) help ;;
        *) help;;
    esac
done

echo $CLIENTPORT
echo $SERVERPORT
export SERVERPORT=$SERVERPORT
export CLIENTPORT=$CLIENTPORT
docker-compose --project-name dndbot down
docker-compose --project-name dndbot up -d