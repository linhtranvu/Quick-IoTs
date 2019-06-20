# An UI Editor for Open MQTT Gateway (OMG)

## Install guide
- Install `Node.js`
- Clone source code,open cmd/shell, run: 
- `npm install`
- `npm install -g electron-forge`
- `npm install --global windows-build-tools` if not installed. In case error/stuck when installing, run `npm install --global --production windows-build-tools@4.0.0`. [Windows Vista / 7 only] requires `.NET Framework 4.5.1`
- `node_modules\.bin\electron-rebuild` to rebuild module for electron

## Deploy and Build
- Deploy for Web: Upload all file except `"modules"` folder
- Build for desktop app: Run `electron-forge make`. A folder name `out` will contain the build version

## API server
- This tool get JSON data of devices, fields... from a `PHP MYSQL API server`.

## Develop guide
- Code is HTML5 and JS so could run as web app
- Base on electron, a NodeJS tool allows making desktop app, run `npm start` to debug app when coding