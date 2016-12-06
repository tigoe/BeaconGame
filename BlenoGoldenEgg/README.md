
##Installing

Per Bleno instructions, you need to:

````
$ sudo apt-get install bluetooth bluez libbluetooth-dev libudev-dev
````

Then:
````
$ npm install
````

## Running
Do the following before running on a Raspberry Pi:

````
$ bluetoothd --version
````

If it's version 5.0 or greater, then:

````
$ sudo /etc/init.d/bluetooth stop
$ sudo hciconfig hci0 up
````

then:
````
$ sudo node goldenEggServer.js
````
