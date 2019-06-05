# An UI Editor for Open MQTT Gateway (OMG)

## Install guide
- Install Node.js
- Clone source code. In source folder run: `npm install`
- Run `npm install -g electron-forge`

## Deploy and Build
- Deploy for Web: Upload all file except `"modules"` folder
- Build for desktop app: Run `electron-forge make`. A folder name `out` will contain the build version

## API server
- This tool get JSON data of devices, fields... from a `PHP MYSQL API server`.

## Develop guide
- Code is HTML5 and JS so could run as web app
- Base on electron, a NodeJS tool allows making desktop app