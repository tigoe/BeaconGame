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

// the app functions:
var app = {
  // initialize runs when the app starts
  initialize: function() {
    this.bindEvents();
  },

  // bindEvents adds listeners for the DOM elements:
  bindEvents: function() {
    console.log("bindEvents");
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
    console.log("login");
    data = 'username=' + username.value;     // format the data as form-urlencoded
    var target = serverAddress.value + '/login'; // add the route to the base URL
    app.postRequest(data, target);      // make the POST request
  },
  // logout is called by the logout button:
  logout: function() {
    data = 'username=' + username.value +    // format the data as form-urlencoded
    '&token=' + token.value;             // add the user token as well
    var target = serverAddress.value + '/logout';// add the route to the base URL
    app.postRequest(data, target);      // make the POST request
  },

// scan for 5 seconds:
  scan: function() {
    ble.scan([service.value], 5, app.listBeacons, app.showError);
  },

  connectToDevice: function(event) {
    var deviceId = event.target.dataset.deviceId;

    // put name and RSSI into fields:
    localname.value = event.target.dataset.name;
    rssi.value = event.target.dataset.rssi;

     var onConnect = function () {
      // get service and characteristic from UI fields
      ble.read(deviceId, service.value, characteristic.value, app.onBeaconData, app.showError);
    };

    ble.connect(deviceId, onConnect, app.onError);
  },


  listBeacons: function(device) {
    var listItem = document.createElement('li'),
    html = '<b>' + device.name + '</b><br/>' +
    'RSSI: ' + device.rssi + '&nbsp;|&nbsp;' +
    device.id;
    // get the device info and save it to the list item
    // so you can pass it when the list item is touched:
    listItem.dataset.deviceId = device.id;
    listItem.dataset.name = device.name;
    listItem.dataset.rssi = device.rssi;
    listItem.innerHTML = html;
    deviceList.appendChild(listItem);
  },

  onBeaconData: function(data) {
      var bytes = new Uint8Array(data);

      console.log("I got: " + bytes[0]);
      points.value = bytes[0];
  },

  claimBeacon: function() {

  },

  // postRequest is called by the login and logout functions:
  postRequest: function(data, target) {
    // instantiate a request object
    var request = new XMLHttpRequest();
    // open a POST request for the URL and route:
    request.open("POST", target, true);
    // set headers for the POST:
    request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    
    // this is called if the ready state of the request changes
    // (i.e. if a response comes in):
    request.onreadystatechange = function() {
      // if you got a good request:
      if(request.readyState == 4 && request.status == 200) {
        // the response is a JSON object. Parse it:
        responseJson = JSON.parse(request.responseText);

        // put the token in the token field so you don't have to type it:
        token.value = responseJson.token;
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

app.initialize();
