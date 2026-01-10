export interface ExampleBom {
  name: string;
  description: string;
  csv: string;
}

export const EXAMPLE_BOMS: ExampleBom[] = [
  {
    name: "Arduino Shield",
    description: "Basic Arduino shield with resistors, caps, and LEDs",
    csv: `Part Number,Description,Qty,Manufacturer,MPN
R1,10k Resistor 0603,4,Yageo,RC0603FR-0710KL
R2,1k Resistor 0603,2,Yageo,RC0603FR-071KL
C1,100nF Capacitor 0603,3,Samsung,CL10B104KB8NNNC
C2,10uF Capacitor 0805,2,Samsung,CL21A106KAYNNNE
LED1,Red LED 0805,2,Wurth,150080RS75000
LED2,Green LED 0805,1,Wurth,150080GS75000
U1,ATmega328P-AU,1,Microchip,ATMEGA328P-AU
J1,2x3 Header 2.54mm,1,Samtec,TSW-103-07-G-D`,
  },
  {
    name: "Power Supply",
    description: "5V 2A buck converter module",
    csv: `Part Number,Description,Qty,Manufacturer,MPN
U1,LM2596 Buck Regulator,1,Texas Instruments,LM2596S-5.0/NOPB
L1,47uH Power Inductor,1,Wurth,744771147
C1,220uF 25V Electrolytic,1,Panasonic,EEE-FK1V221P
C2,100uF 10V Electrolytic,1,Panasonic,EEE-FK1A101P
D1,SS34 Schottky Diode,1,ON Semiconductor,SS34
R1,10k Resistor 0805,1,Vishay,CRCW080510K0FKEA
R2,3.3k Resistor 0805,1,Vishay,CRCW08053K30FKEA`,
  },
  {
    name: "Sensor Module",
    description: "I2C temperature and humidity sensor board",
    csv: `Part Number,Description,Qty,Manufacturer,MPN
U1,BME280 Environmental Sensor,1,Bosch,BME280
U2,ADS1115 ADC,1,Texas Instruments,ADS1115IDGSR
C1,0.1uF Capacitor,4,Murata,GRM155R71C104KA88D
R1,4.7k Resistor,2,Panasonic,ERJ-3EKF4701V
J1,4-pin JST Connector,1,JST,B4B-XH-A
LED1,Blue LED 0603,1,Kingbright,APT1608QBC/D`,
  },
  {
    name: "Simple LED Circuit",
    description: "Minimal LED blinker for beginners",
    csv: `Part Number,Description,Qty,Manufacturer,MPN
R1,330 Ohm Resistor,1,Yageo,CFR-25JB-52-330R
LED1,5mm Red LED,1,Kingbright,WP7113ID
SW1,Tactile Switch,1,Omron,B3F-1000
BT1,CR2032 Holder,1,Keystone,3034`,
  },
];

export function getExampleByName(name: string): ExampleBom | undefined {
  return EXAMPLE_BOMS.find((ex) => ex.name === name);
}
