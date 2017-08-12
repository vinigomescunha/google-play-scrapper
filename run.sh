#!/bin/bash
protocol="http";
host='localhost';
port=8888
killport="fuser -k $port/tcp"
zenity --question --title="Run NPM?" --text "Run NPM to install Node dependencies?"  --ok-label="Okay" --cancel-label="Dont need :)" 
rc=$?
if [ "${rc}" == "0" ]; then
echo $rc
        npm install | zenity --progress --title="Wair .." --text="Wait .." --percentage=2
        zenity  --info --text="Complete!"
fi
eval "$killport" 2>&1
gnome-terminal -x bash -c "$(printenv | grep http_proxy) npm run googleplayscrapper;read" &
sleep 2
google-chrome "$protocol://$host:$port"
