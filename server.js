/*
Express.js Beacon game
in Express.js 4.0

created 15 Mar 2015
modified 22 Nov 2016
by Tom Igoe

TO DO:  Add in a feature to send different formats of UUID, using the parse/unparse
functions from the npm UUID library.

*/
var config = require('./config.js');
var express = require('express');         // include express.js
var app = express();                      // a local instance of it
var bodyParser = require('body-parser');  // include body-parser
var uuid = require('node-uuid');          // include a UUID generator
var http = require('http');               // include http to make a client

// the service UUID and characteristic UUID for the game:
var serviceUuid = config.serviceUuid;
var characteristicUuid = config.characteristicUuid;
var users = config.users;
var beacons = config.beacons;
var adminKey = config.adminKey;
var gameOver = false;
var winner = '';

app.use(express.static('public'));                  // static files go in /public
app.use(bodyParser.json());                         // for  application/json
app.use(bodyParser.urlencoded({ extended: true })); // for application/x-www-form-urlencoded

// this runs after the server successfully starts:
function serverStart() {
  var port = server.address().port;
  console.log('Server listening on port '+ port + ' at ' + new Date());
}

// callback function for the route /login:
function login(request, response) {
  var thisUser = {
    score : 0,
    token : uuid.v4()                 // generate a token
  };
  if (request.method === 'GET') {
    thisUser.username = request.params.username;  // get submitted username
    thisUser.ip = request.ip; // get submitted client IP address
    thisUser.adminKey = request.params.adminKey; // get user admin key, if submitted
  }

  if (request.method === 'POST') {
      thisUser.username = request.body.username;  // get submitted username
      thisUser.ip = request.ip;                  // get submitted client IP address
      thisUser.adminKey = request.body.adminKey;  // get user admin key, if submitted
  }
  var result = {};               // JSON object for returning results

  userIndex = -1;                     // index of the requested user in the list
  result.timestamp = new Date();      // timestamp the response result
  result.clientAddress = request.ip;  // add the client address to the result

  // iterate over the users list
  users.forEach(function(user) {
    if (user.ip === thisUser.ip && user.username != thisUser.username) {
      // if they have logged in another user from this address,
      // don't let them re-register:
      result.error ='another user is logged in from this address, ' + thisUser.username;
    }

    // if the username matches the request username:
    if (user.username === thisUser.username) {
      if (user.token) {
        // if they have a token already, don't let them re-register:
        result.error ='you have an existing token, ' + thisUser.username;
      }

      if (user.ip && user.ip != thisUser.ip) {
        // if they are logged in from another address,
        // don't let them re-register:
        result.error = thisUser.username + ' is logged in from another address.';
      }
      if (thisUser.adminKey === adminKey) {
        // they get admin privileges
        user.admin = true;
      }
      // you'll need the index of this user in the list later,
      // so save it to a variable:
      userIndex = users.indexOf(user);
    }
  });

  // here's where you use the index of the user:
  if (userIndex === -1) {
    // if they are not in the list,
    // don't let them log in:
    result.error = thisUser.username + ' is not in the list of users.';
  }

  // if you got through with no errors, you have a valid user:
  if (!result.error) {
    // transfer properties from thisUser to users[userIndex]:
    users[userIndex].username = thisUser.username;
    users[userIndex].ip = thisUser.ip;
    users[userIndex].score = thisUser.score;
    users[userIndex].token = thisUser.token;
    result.username = thisUser.username;    // add the username to the response result
    result.token = thisUser.token;          // add the token
    result.service = serviceUuid;           // add service UUID and the characteristic UUID
    result.characteristic = characteristicUuid;
  }

  // send a JSON response:
  response.json(result).end();
  console.log(result);
  console.log('\n');
}

// callback function for the route /logout:
function logout(request, response) {
  var result = {};                      // JSON object for returning results
  var thisUser = request.body.username; // get submitted username
  var thisToken = request.body.token;   // get the user ID token
  result.timestamp = new Date();        // timestamp the response result
  result.clientAddress = request.ip;    // add the client address to the result

  // iterate over the users list:
  users.forEach(function(user) {
    if (user.username === thisUser) {   // if the username matches the request username
      if (user.token === thisToken ||   // if the token matches the request token
        user.ip === request.ip) {       // or the client IP matches the user IP
          user.token = null;            // clear the user token
          user.score = 0;               // clear the user score
          user.ip = null;               // clear the user IP
          releaseBeacons(thisUser);     // release any beacons the user has claimed
          result.message = 'user ' + user.username + ' logged out';
        }  else {                         // if they didn't give you a valid token,
        result.error ='invalid token for user ' + thisUser;
      }
    }
  });

  // send a JSON response:
  response.json(result).end();
  console.log(result);
  console.log('\n');
}

// helper function for the logout() function. Releases all beacons
// owned by a given owner:
function releaseBeacons(user) {
  beacons.forEach(function(beacon){
    if (beacon.owner === user) {
      beacon.owner = null;
    }
  });
}


function clearUser(request, response) {
  var result = {};

  var thisUser = request.params.username;
  users.forEach(function(user) {
    if (user.username === thisUser) {
      user.token = null;            // clear the user token
      user.score = 0;               // clear the user score
      user.ip = null;               // clear the user IP
      releaseBeacons(thisUser);     // release any beacons the user has claimed
      result.message = 'WARNING: user ' + user.username + ' cleared';
      result.timestamp = new Date();
    }
  });

  // send a JSON response:
  response.json(result).end();
  console.log(result);
  console.log('\n');
}

// helper function for server admin:
function listBeacons(request, response) {
  var result = {};
  users.forEach(function(user){     // check the list
    if (user.ip === request.ip &&   // if there's a user with this IP
    user.admin === true) {        // and that user is the admin
      result = beacons;           // then he or she can see the result
    } else {
      result.error = 'you are not an administrator.';
    }
  });
  // send a JSON response:
  response.json(result).end();
  console.log(result);
  console.log('\n');
}

// helper function for server admin:
function listUsers(request, response) {
  console.log(request.body);
  var result = {};
  users.forEach(function(user){
    if (user.ip === request.ip &&
      user.admin === true) {
        result = users;
      } else {
        result.error = 'you are not an administrator.';
      }
    });
    // send a JSON response:
    response.json(result).end();
    console.log(result);
    console.log('\n');
  }
  /*

  callback function for the route /login

  client will send:
  "token": your tokenUuid,
  "localname": the local name of the peripheral that you found,
  "rssi": the RSSI that you got when you found the peripheral,
  "characteristic":  the only characteristic that the <serviceUuid> service has
  "points": the value of the <characteristicUuid> characteristic
  */

  function getBeacon(request, response) {
    var result = {};                            // JSON object for returning results
    var thisUser;                               // the user who made this request
    users.forEach(function(user) {              // look up user from the request token
      if (user.token === request.body.token) {  // if the token matches, then
        thisUser = user;                        // this is the right user
      }
    });
    result.timestamp = new Date();        // timestamp the response result
    result.clientAddress = request.ip;    // add the client address to the result

    // if the game is over, tell the user that:
    if (gameOver === true) {
      result.error = 'The game is over. ' + winner + ' has won.';
    }

    // if the game is not over,
    // iterate over the beacons to validate the claim:
    beacons.forEach(function(beacon){
      // if one matches the request name:
      if (request.body.localname === beacon.name) {
        // check rssi:
        if (request.body.rssi < beacon.rssiLimit) {
          result.error = 'not close enough to claim beacon';
        }
        // check owner:
        if (beacon.owner) {
          result.error = 'beacon already claimed';
        }
        // check points:
        if (request.body.points != beacon.points) {
          result.error = 'incorrect characteristic value';
        }
        // if there's still no error, credit the user:
        if (!result.error) {
          result.message = 'success';
          result.localname = beacon.localname;  // set the result localname for response
          users.forEach(function(user) {        // iterate over the user list
            if (user === thisUser) {            // find the user who submitted this
              beacon.owner = user.username;     // set the beacon owner
              user.score += beacon.points;      // increment the user's points
              checkScores();                    // check to see if anyone's score > 50
              result.username = user.username;  // set the result username
              result.score = user.score;        // set the result user's score
              if (beacon.localname === 'GoldenEgg') {
                winner = user.username;
                result.message += user.username + ' has claimed the golden egg.';
                gameOver = true;
              }
            }
          });
        }
      }
    });

    response.json(result).end(); // send the result
    console.log(result);
    console.log('\n');
  }

  // checks to see if any user has reached 50 points:
  function checkScores() {
    users.forEach(function(user) {        // iterate over the user list
      if (user.score >= 50) {
        console.log('user ' + user.username + ' has unlocked the golden egg.');
        unlockGoldenEgg();
      }
    });
  }

  function unlockGoldenEgg() {
    // make the POST data a JSON object and stringify it:
    var postData =JSON.stringify({
      serviceName: config.goldenEgg.serviceName,
      uuid: config.goldenEgg.uuid
    });

    // set up the options for the request.
    var options = {
      host: config.goldenEgg.host,
      port: config.goldenEgg.port,
      path: '/start',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData.length
      }
    };

    function waitForResponse(response) {
      var result = '';		// string to hold the response

      // as each chunk comes in, add it to the result string:
      response.on('data', function (data) {
        result += data;
      });

      // when the final chunk comes in, print it out:
      response.on('end', function (error) {
        if (error) console.log(error);
        console.log(result);
      });

    }

    // make the actual request:
    console.log('requesting the golden egg to turn on:');
    var request = http.request(options, waitForResponse);	// start it
    request.write(postData);							// send the data
    request.end();												// end it
  }

  // start the server:
  var server = app.listen(8080, serverStart);
  // start the listeners for GET requests:
  //app.get('/files/:name', serveFiles);  // GET handler for all static files
  app.post('/listBeacons', listBeacons);
  app.post('/listUsers', listUsers);
  app.post('/login/', login);           // login page (TBD)
  app.get('/login/:username', login);// login page (TBD)
  app.post('/logout/', logout);           // login page (TBD)
  app.get('/clearUser/:username', clearUser);           // clear user page
  app.post('/beacon', getBeacon);      // request for beacon
