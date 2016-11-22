/*
Beacon game login/logout client

Logs in and out of the beacon game. This is a stub for the whole beacon game
client application.

created 18 April 2015
by Tom Igoe

*/

// data to be used in processing the beacons:
var beaconData = {
  service: null,
  characteristic: null,
  rssi: null,
  localname: null,
  points:null
};

// data about the server:
var server = {
  url: 'http://104.236.16.105'
};

// data about the user:
var user = {
  name: 'ti8',
  token: null
};

// the app functions:
var app = {
  // initialize runs when the app starts
  initialize: function() {
    this.bindEvents();
  },

  // bindEvents adds listeners for the DOM elements:
  bindEvents: function() {
    document.addEventListener('deviceready', this.onDeviceReady, false);
    loginButton.addEventListener('touchend', this.login, false);
    logoutButton.addEventListener('touchend', this.logout, false);
    claimButton.addEventListener('touchend', this.claimBeacon, false);
    scanButton.addEventListener('touchend', this.scan, false);
    deviceList.addEventListener('touchstart', this.connectToDevice, false);
  },

  // onDeviceReady runs when the page finishes loading:
  onDeviceReady: function() {
    console.log('device is ready');
  },

  // login is called by the login button:
  login: function() {
    data = 'username=' + user.name;     // format the data as form-urlencoded
    var target = server.url + '/login'; // add the route to the base URL
    app.postRequest(data, target);      // make the POST request
  },
  // logout is called by the logout button:
  logout: function() {
    data = 'username=' + user.name +    // format the data as form-urlencoded
    '&token=' + user.token;             // add the user token as well
    var target = server.url + '/logout';// add the route to the base URL
    app.postRequest(data, target);      // make the POST request
  },


  scan: function() {
    ble.scan([service.value], 5, app.listBeacons, app.showError);
  },

  connectToDevice: function(event) {
    console.log('connectToDevice');
    var deviceId = event.target.dataset.deviceId
    console.log(deviceId);
    message.innerHTML = deviceID;

    var deviceId = e.target.dataset.deviceId,
    onConnect = function() {

      // get service and characteristic from UI fields
      ble.startNotification(deviceId, service.value, characteristic.value, app.onBeaconData, app.showError);
    };

    ble.connect(deviceId, onConnect, app.onError);
  },


  listBeacons: function(device) {
    var listItem = document.createElement('li'),
    html = '<b>' + device.name + '</b><br/>' +
    'RSSI: ' + device.rssi + '&nbsp;|&nbsp;' +
    device.id;

    listItem.dataset.deviceId = device.id;
    listItem.innerHTML = html;
    deviceList.appendChild(listItem);
  },

  onBeaconData: function() {

  },

  claimBeacon: function() {

  },
  
  // postRequest is called by the login and logout functions:
  postRequest: function(data, target) {
    // instantiate a request object
    var request = new XMLHttpRequest();
    // get the user token:
    var tokenField = document.getElementById('token');
    // open a POST request for the URL and route:
    request.open("POST", target, true);
    // set headers for the POST:
    request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    request.setRequestHeader("Content-length", data.length);

    // this is called if the ready state of the request changes
    // (i.e. if a response comes in):
    request.onreadystatechange = function() {
      // if you got a good request:
      if(request.readyState == 4 && request.status == 200) {
        // the response is a JSON object. Parse it:
        responseJson = JSON.parse(request.responseText);

        // put the token in the token field so you don't have to type it:
        tokenField.value = responseJson.token;
        // put the rest of the results in the appropriate objects:
        user.token = responseJson.token;
        characteristic.value = responseJson.characteristic;
        service.value = responseJson.service;
        // show the whole result in the postResult div:
        message.innerHTML = JSON.stringify(responseJson);

      }
    };
    // send the actual request:
    request.send(data);
  },

  showError: function(error) {
    message.innerHTML = error;
  }
};
