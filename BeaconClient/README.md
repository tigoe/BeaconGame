# Beacon Client

A cordova-based client for the Beacon Game.

## Contents of the Directory

* www/
  * the www folder for the client. contains js/index.js, img/, and css/index.css
  * Only files you should need to edit are index.html and js/index.js
  * config.xml can be the cordova standard file

## Installation Instructions

You will need cordova and the SDK for your mobile platform (Android or iOS have been tested) already. Then:

````
$ cordova create BeaconClient
$ cordova platform add android

````

Then replace the www folder generated by cordova with the www folder in this directory. Then:

````
$ cordova prepare
$ cordova run

````
