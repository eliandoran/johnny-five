var Board = require("./board");

// Adapted from https://github.com/sparkfun/SparkFun_SerLCD_Arduino_Library/blob/master/src/SerLCD.h.
const DISPLAY_ADDRESS1 = 0x72;
const MAX_ROWS = 4
const MAX_COLUMNS = 20

const SPECIAL_COMMAND = 254;
const SETTING_COMMAND = 0x7C;

const CLEAR_COMMAND = 0x2D;
const CONTRAST_COMMAND = 0x18;
const ADDRESS_COMMAND = 0x19;
const SET_RGB_COMMAND = 0x2B;
const ENABLE_SYSTEM_MESSAGE_DISPLAY = 0x2E;
const DISABLE_SYSTEM_MESSAGE_DISPLAY = 0x2F;
const ENABLE_SPLASH_DISPLAY = 0x30;
const DISABLE_SPLASH_DISPLAY = 0x31;
const SAVE_CURRENT_DISPLAY_AS_SPLASH = 0x0A;

const LCD_RETURNHOME = 0x02;
const LCD_ENTRYMODESET = 0x04;
const LCD_DISPLAYCONTROL = 0x08;
const LCD_CURSORSHIFT = 0x10;
const LCD_SETDDRAMADDR = 0x80;

const LCD_ENTRYRIGHT = 0x00;
const LCD_ENTRYLEFT = 0x02;
const LCD_ENTRYSHIFTINCREMENT = 0x01;
const LCD_ENTRYSHIFTDECREMENT = 0x00;

const LCD_DISPLAYON = 0x04;
const LCD_DISPLAYOFF = 0x00;
const LCD_CURSORON = 0x02;
const LCD_CURSOROFF = 0x00;
const LCD_BLINKON = 0x01;
const LCD_BLINKOFF = 0x00;

const LCD_DISPLAYMOVE = 0x08;
const LCD_CURSORMOVE = 0x00;
const LCD_MOVERIGHT = 0x04;
const LCD_MOVELEFT = 0x00;

/**
 * This atrocity is unfortunately necessary.
 * If any other approach can be found, patches
 * will gratefully be accepted.
 */
function sleepus(usDelay) {
  const startTime = process.hrtime();
  let deltaTime;
  let usWaited = 0;

  while (usDelay > usWaited) {
    deltaTime = process.hrtime(startTime);
    usWaited = (deltaTime[0] * 1E9 + deltaTime[1]) / 1000;
  }
}

/**
 * This atrocity is unfortunately necessary.
 * If any other approach can be found, patches
 * will gratefully be accepted.
 */
function sleep(ms) {
  sleepus(ms * 1000);
}

class SerLCD {

  constructor(options) {
    this.address = DISPLAY_ADDRESS1;

    Board.Component.call(
      this, options = Board.Options(options)
    );

    this.initialize();
  }

  initialize() {
    this.io.i2cConfig({
      address: this.address
    });
  }

  command(commandByte) {
    this.io.i2cWrite(this.address, [ SETTING_COMMAND, commandByte ]);
  }

  clear() {
    this.command(CLEAR_COMMAND);
    sleep(10);
    return this;
  }

}

module.exports = SerLCD;
