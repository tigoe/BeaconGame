// the list of users for the game:
exports.users = [
  {'username': 'aa123'},
  ];
  // the list of beacons for the game:
exports.beacons = [
  {'name':'beacon1','points':2, rssiLimit: -50, 'owner':null},
  {'name':'beacon2','points': 20, rssiLimit: -50, 'owner':null},
  {'name':'beacon3','points':12, rssiLimit: -50, 'owner':null},
  {'name':'beacon4','points':6, rssiLimit: -50, 'owner':null},
  {'name':'beacon5','points':18, rssiLimit: -50, 'owner':null},
];

// The RSSI value that the user submits can differ from the beacon's rssiLimit
// by this much:
exports.beaconLimit = 2;

exports.serviceUuid = 'AAAAAAAA-BBBB-CCCC-1111-1234AAAACCCC';
exports.characteristicUuid = 'AAAAAA20-BBBB-CCCC-1111-1234AAAACCCC';
exports.adminKey = 'secret!';

exports.goldenEgg = {
  serviceName: 'goldenEgg',
  name: 'goldenEgg',
  serviceUuid: 'AAAAAAAA-BBBB-CCCC-1111-1234AAAACCCC',
  characteristicUuid: 'AAAAAA20-BBBB-CCCC-1111-1234AAAACCCC',
  points: 1,
  rssi: --50,
  owner: null,
  host: '1.1.1.1',
  port: 8080
};
