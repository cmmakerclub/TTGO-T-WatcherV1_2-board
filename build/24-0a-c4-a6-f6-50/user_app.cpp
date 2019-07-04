#include <Arduino.h>
#include <WiFi.h>
#include <WiFiClient.h>
#include <WiFiAP.h>
#include <WebServer.h>
#include "SPI.h"
#include "pins_arduino.h"
#include <Adafruit_GFX.h>
#include <Adafruit_ILI9341.h>

Adafruit_ILI9341 tft = Adafruit_ILI9341(T4_TFT_CS, T4_TFT_DC);







void setup()
{
  pinMode(T4_BUTTON1, INPUT_PULLUP);
  pinMode(T4_BUTTON2, INPUT_PULLUP);
  pinMode(T4_BUTTON3, INPUT_PULLUP);
  pinMode(T4_TFT_BL, OUTPUT);
  digitalWrite(T4_TFT_BL, HIGH);

  tft.begin();
  tft.setRotation(0);
  tft.fillScreen(0xFFFF);
  tft.setTextSize(1);
  
  
  
    tft.setRotation(3);
  tft.fillScreen(0x0);

    tft.setTextSize(3);
    tft.setCursor(0, 0);
    tft.setTextColor(0xffff);
    tft.println(String((char *)"Hello World!"));

    tft.drawLine(10,50,100,100,0xf800);

      tft.drawRect(10,90,50,30,0xfb20);

      tft.fillCircle(164,150,40,0x37e6);




}
void loop()
{
  
  
}
