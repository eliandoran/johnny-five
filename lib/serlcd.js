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

    this._displayControl = LCD_DISPLAYON | LCD_CURSOROFF | LCD_BLINKOFF;
    this._displayMode = LCD_ENTRYLEFT | LCD_ENTRYSHIFTDECREMENT;

    this.initialize();
  }

  initialize() {
    this.io.i2cConfig({
      address: this.address
    });
    
    this.specialCommand(LCD_DISPLAYCONTROL | this._displayControl);
    this.specialCommand(LCD_ENTRYMODESET | this._displayMode);
    this.clear();
  }

  _write(data) {
    this.io.i2cWrite(this.address, data);
  }

  command(commandByte, ...params) {
    this._write([ SETTING_COMMAND, commandByte, ...params ]);
  }

  specialCommand(commandByte, count=1) {
    for (let i=0; i<count; i++) {
      this._write([ SPECIAL_COMMAND, commandByte ]);
    }
    
    sleep(50);  // same as original library
  }

  clear() {
    this.command(CLEAR_COMMAND);
    sleep(10);  // same as original library
    return this;
  }

  noCursor() {
    this._displayControl &= ~LCD_CURSORON;
    this.specialCommand(LCD_DISPLAYCONTROL | this._displayControl);
  }

  cursor() {
    this._displayControl |= LCD_CURSORON;
    this.specialCommand(LCD_DISPLAYCONTROL | this._displayControl);
  }

  home() {
    this.specialCommand(LCD_RETURNHOME);
  }

  moveCursorLeft(count = 1) {
    this.specialCommand(LCD_CURSORSHIFT | LCD_CURSORMOVE | LCD_MOVELEFT, count);
  }

  moveCursorRight(count = 1) {
    this.specialCommand(LCD_CURSORSHIFT | LCD_CURSORMOVE | LCD_MOVERIGHT, count);
  }

  setCursor(col, row) {
    const rowOffsets = [ 0x00, 0x40, 0x14, 0x54 ];
    row = Math.min(row, MAX_ROWS - 1);
    this.specialCommand(LCD_SETDDRAMADDR | (col + rowOffsets[row]));
  }

  scrollDisplayLeft(count = 1) {
    this.specialCommand(LCD_CURSORSHIFT | LCD_DISPLAYMOVE | LCD_MOVELEFT, count);
  }

  scrollDisplayRight(count = 1) {
    this.specialCommand(LCD_CURSORSHIFT | LCD_DISPLAYMOVE | LCD_MOVERIGHT, count);
  }

  noBlink() {
    this._displayControl &= ~LCD_BLINKON;
    this.specialCommand(LCD_DISPLAYCONTROL | this._displayControl);
  }

  blink() {
    this._displayControl |= LCD_BLINKON;
    this.specialCommand(LCD_DISPLAYCONTROL | this._displayControl);
  }

  noDisplay() {
    this._displayControl &= ~LCD_DISPLAYON;
    this.specialCommand(LCD_DISPLAYCONTROL | this._displayControl);
  }

  display() {
    this._displayControl |= LCD_DISPLAYON;
    this.specialCommand(LCD_DISPLAYCONTROL | this._displayControl);
  }

  autoscroll() {
    this._displayMode |= LCD_ENTRYSHIFTINCREMENT;
    this.specialCommand(LCD_ENTRYMODESET | this._displayMode);
  }

  noAutoscroll() {
    this._displayMode &= ~LCD_ENTRYSHIFTINCREMENT;
    this.specialCommand(LCD_ENTRYMODESET | this._displayMode);
  }

  leftToRight() {
    this._displayMode |= LCD_ENTRYLEFT;
    this.specialCommand(LCD_ENTRYMODESET | this._displayMode);
  }

  rightToLeft() {
    this._displayMode &= ~LCD_ENTRYLEFT;
    this.specialCommand(LCD_ENTRYMODESET | this._displayMode);
  }

  setContrast(contrastValue) {
    this.command(CONTRAST_COMMAND, contrastValue);
  }

  print(message) {
    // Escape "|" character since it's used to issue commands.
    message = message.replace(/\|/g, "||");

    // TODO: Add support for custom characters
    let buffer = [];
    for (let i=0; i < message.length; i++) {
      buffer.push(message.charCodeAt(i));
    }

    this._write(buffer);
  }

}

module.exports = SerLCD;
