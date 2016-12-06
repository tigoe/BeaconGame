/*
Peripheral server

Runs a HTTP server to control a Bluetooth LE peripheral.
The peripheral has one service. The service has a single characteristic,
which has a single-byte value.

HTTP requests:
POST data, with the following body:
{
serviceName: whatever name you want,
uuid: the service uuid. Must match the uuid for gameService, in this code.
}

/start starts the service
/stop stops it

created 16 Apr 2015
updated 6 Dec. 2016
by Tom Igoe
*/

var config = require('../config.js');
var bleno = require('bleno');
var express = require('express');         // include express.js
var app = express();                      // a local instance of it
var bodyParser = require('body-parser');  // include body-parser

var deviceConfig = config.goldenEgg;
var serviceName = deviceConfig.serviceName; // peripheral's localName

var points = new Buffer(1);   // Buffer for characteristic value
points[0] = deviceConfig.points;               // actual value of the characteristic
process.env['BLENO_DEVICE_NAME'] = serviceName;

app.use(express.static('public'));                  // static files go in /public
app.use(bodyParser.json());                         // for  application/json
app.use(bodyParser.urlencoded({ extended: true })); // for application/x-www-form-urlencoded

// this runs after the server successfully starts:
function serverStart() {
  var port = server.address().port;
  console.log('Server listening on port '+ port + ' at ' + new Date());
}

var PrimaryService = bleno.PrimaryService;    // instantiate PrimaryService
var Characteristic = bleno.Characteristic;    // instantiate PrimaryCharacteristic


var bluetoothState = null;  // bluetooth radio state

// define the service's characteristic:
var pointsCharacteristic = new Characteristic({
  uuid: deviceConfig.characteristicUuid, //  characteristic UUID
  properties: [ 'read' ],                //  characteristic properties
  value: points                          // characteristic value
});

// define the service:
var gameService = new PrimaryService({
  uuid: deviceConfig.serviceUuid,         // service UUID
  characteristics: [pointsCharacteristic] // service characteristic
});

function readme(request, response) {
  var result = 'This is a Bluetooth LE peripheral. <br />' +
//' To turn it on, send the following in a POST request to /start or /stop:' +
//  '{<br />serviceName: whatever name you want, <br />' +
//  'uuid: the service uuid <br />}<br />' +
  '<br /> Current state of the peripheral:' + bluetoothState;

  response.send(result).end(); // send the result
  console.log(result);
  console.log('\n');
}

function startService(request, response) {
  changeService(request, response, true);
}

function stopService(request, response) {
  changeService(request, response, false);
}

// start advertising a service:
function changeService(request, response, start) {
  var result = {};
  var thisName = request.body.serviceName;
  // get the uuid and remove the dashes:
  var thisService = request.body.uuid.split('-');
  thisService = thisService.join('');

  result.timestamp = new Date();
  result.state = start;

  console.log(request.body);

  if (thisName != serviceName) {
    result.error = 'error. incorrect service name.'
  }

  if (thisService != gameService.uuid) {
    result.error = 'error. incorrect service uuid.'
  }

  if (bluetoothState != 'poweredOn') {
    result.error = 'error. Bluetooth not powered on.'
  }

  if (!result.error)  {
    if (start === true){
      bleno.startAdvertising(serviceName, [gameService.uuid]);
      result.serviceName = thisName;
      result.uuid = thisService;
      console.log('advertising ' + thisName);
    } else {
      bleno.stopAdvertising();
      console.log('stopped advertising ' + thisName);
    }
  }

  response.json(result).end(); // send the result
  console.log(result);
  console.log('\n');
}

function startPeripheral(state) {
  console.log('on -> stateChange: ' + state);
  bluetoothState = state;
}

function startAdvertising(error) {
  console.log('Bluetooth on. advertisingStart: ')
  if (error) {
    console.log('error ' + error);
  }  else {
    // if advertising start succeeded, start the services
    console.log('success');
    bleno.setServices([gameService], function(serviceError){
      console.log('Starting services: ')
      if (serviceError) {
        console.log('error ' + serviceError);
      } else {
        console.log('game service set.');
      }
    });
  }
}

// listener for radio turning on:
bleno.on('stateChange', startPeripheral);
// listener for advertising start:
bleno.on('advertisingStart', startAdvertising);

// start the server:
var server = app.listen(8080, serverStart);
// start the listeners for GET requests:
app.get('/', readme);
app.post('/start', startService);
app.post('/stop', stopService);
