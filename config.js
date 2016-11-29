// the list of users for the game:
exports.users = [
  {'username': 'aaa111'},   // netID
  {'username': 'bbb222'}   // netID
  ];

// the list of beacons for the game:
exports.beacons = [
  {'name':'beaconName','points':0, rssiLimit: -0, 'owner':null},
];

// Service UUID and beacon UUID for the game's beacons:
exports.serviceUuid = 'AAAAAAA-BBBB-CCCC-DDDD-EEEEEEEEEEEE';
exports.characteristicUuid = 'AAAAAAA-BBBF-CCCC-DDDD-EEEEEEEEEEEE';

// details for the golden egg:
exports.goldenEgg = {
  serviceName: 'name',
  uuid: 'AAAAAAA-BBBB-CCCC-DDDD-EEEEEEEEEEEE',
  host: '1.1.1.1',
  port: 8080
};
