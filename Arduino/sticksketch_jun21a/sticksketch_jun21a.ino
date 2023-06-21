
#define JOYSTICKY_PIN A1
int dirstick = 0;
#define POTENTIOMETER_PIN A0
int dirangle = 0;

void setup() {
  
  Serial.begin(115200);
}

void loop() {
  int joystickValue = analogRead(JOYSTICKY_PIN);
  dirstick = map(joystickValue, 0, 1023, -180, 180);
  int data = analogRead(POTENTIOMETER_PIN);
  dirangle = map(data, 0, 1023, -90, 90);
  Serial.print(dirstick);
  Serial.print(' ');
  Serial.print(dirangle);
  Serial.println("");
  Serial.flush();
 
  delay(10); 
}
