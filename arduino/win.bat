@echo off
echo /////////////////////////////////////////////////////////////////////
echo //     PROJECT IS BEING BUILD AND UPLOAD TO DEVICE. PLEASE WAIT... //
echo /////////////////////////////////////////////////////////////////////
echo on
"D:\Program Files (x86)\Arduino\arduino_debug"  --board esp8266:esp8266:nodemcuv2  --pref sketchbook.path="D:\IOTs\Project\OpenMQTTGateway"  --port COM5  --upload "D:\IOTs\Project\OpenMQTTGateway\OpenMQTTGateway.ino"
 pause