# Beacon Game

A Blueooth LE hide-and-seek game.  In this game, a number of Bluetooth LE peripherals are set up as beacons around the playing space. Players search for the hidden beacons and submit their data to a server via HTTP request. The beacons will have various names, but they’ll all have a service on them with the same uuid. When any player gains enough points, the server activates a special hidden beacon called the Golden Egg. The first player to claim the Golden Egg wins.

## Contents of the Repository
* server.js - the server program. Includes a public folder containing two web clients:
  * index.html
  * admin.html
* BeaconClient - a cordova client application
* Beacon - Arduino sketch for the beacons
* BlenoGoldenEgg - a bleno peripheral for the Golden Egg beacon

## Game Play
Players are all required to build a Bluetooth LE central and REST client application that scans for peripherals, reads the common service and its characteristic. Submit the UUID and value of the characteristic, and the received signal strength when you read it to the server to claim a beacon.

You can build your client and central application in whatever framework you like, or you can use existing tools for the job. At the start, make a POST request with your ID (assigned by whoever is running the game) (http://servername.net/login/, with username=ID in the body). You can also login with a GET request like so: http://servername.net/login/netID You’ll get a reply like so:
````
{
 "token": tokenUuid,
 "service": serviceUuid,
 "characteristic": characteristicUuid
}
````
* tokenUuid: uuid that you need to submit with every request after that to identify yourself.
* serviceUuid: the uuid of the service that all the peripherals have.
* characteristicUuid: the only characteristic that the <serviceUuid> service has
Search for peripherals with the serviceUuid on them. When you find one, make a POST request to the server (http://servername.net/beacon/) with the following data:

````
{
   "token": your tokenUuid,
   "localname": local name of the peripheral you found,
   "rssi": RSSI from the peripheral,
   "characteristic": only characteristic of the service,
   "points": the value of the characteristic
 }
 ````

You need to be close to a peripheral to claim it, so the RSSI meter matters. When you successfully claim a token, the service will credit you with its points (the value of characteristicUuid). Future attempts to claim that peripheral will fail.

When one player gets to 50 points, the Golden Egg will appear. This is a special peripheral with the local name “Golden Egg”. To claim the Golden Egg, use the same method as for other peripherals. You’ll need to be close to it, and you’ll need to get the point value correct, in order to claim it. The first player to successfully claim the Golden Egg wins! Yay! Cake!
