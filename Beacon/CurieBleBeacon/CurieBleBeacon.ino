
// Import libraries:
#include <SPI.h>
#include <CurieBLE.h>

const int connectedLED = LED_BUILTIN;

// create peripheral instance:
BLEPeripheral peripheral = BLEPeripheral();
// create service:
BLEService counterService = BLEService("A495FF20-C5B1-4B44-B512-1370F02D74DE");
// create characteristic:
BLEIntCharacteristic counterCharacteristic = BLEIntCharacteristic("A495FF25-C5B1-4B44-B512-1370F02D74DE", BLERead | BLENotify);

void setup() {
  Serial.begin(9600);           // initialize serial
  pinMode(connectedLED, OUTPUT);// set LED as output

  // set advertised local name and service UUID:
  peripheral.setLocalName("Beacon1");
  peripheral.setAdvertisedServiceUuid(counterService.uuid());

  // add service and characteristic:
  peripheral.addAttribute(counterService);
  peripheral.addAttribute(counterCharacteristic);

  // start peripheral:
  peripheral.begin();
  counterCharacteristic.setValue(12);
}

void loop() {
  BLECentral central = peripheral.central();
  // Only take action if there's a central connected:
  if (central) {
    // central connected to peripheral
    Serial.print("Connected to central: ");
    Serial.println(central.address());

    while (central.connected()) {
      digitalWrite(connectedLED, HIGH);
    }
    // when the central disconnects, turn the LED off:
    digitalWrite(connectedLED, LOW);
    Serial.print("Disconnected from central: ");
    Serial.println(central.address());
  }
}
