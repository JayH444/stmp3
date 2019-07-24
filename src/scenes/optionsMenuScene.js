// Options menu scene.

class optionsMenuScene extends Phaser.Scene {
  constructor() {
    super({key: 'optionsMenuScene'});
    this.preload = optionsMenuPreload;
    this.create = optionsMenuCreate;
    this.update = optionsMenuUpdate;
  }
}

function optionsMenuPreload() {
  parentThis = this;
}

function optionsMenuCreate() {
  parentThis = this;

  let setKeys = 'Set Controls';
  let setKeysFunc = () => {
    parentThis.scene.launch('keyBindingScene');
    parentThis.scene.stop('optionsMenuScene');
    destroyMenuElements()
  };
  let returnText = 'Return';
  let returnFunc = () => {
    parentThis.scene.launch('titleScene');
    parentThis.scene.stop('optionsMenuScene');
    destroyMenuElements()
  };

  //addMenuElementCenterX(playText, playFunc, 'playText', centerY - 4);
  addMenuElementCenterX(returnText, returnFunc, 'returnText', centerY + 12);

  let menuCursorArgs = [
    parentThis,
    textObjects[menuElements[0][1]][0].x-10,
    textObjects[menuElements[0][1]][0].y,
    'menuCursor',
    menuElements
  ];
  window.menuCursor = new menuCursorClass(...menuCursorArgs);

  // This creates the keybinds:
  cursors = this.input.keyboard.addKeys({
    up: Phaser.Input.Keyboard.KeyCodes.W,
    down: Phaser.Input.Keyboard.KeyCodes.S,
    left: Phaser.Input.Keyboard.KeyCodes.A,
    right: Phaser.Input.Keyboard.KeyCodes.D,
    b: Phaser.Input.Keyboard.KeyCodes.SPACE,
    a: Phaser.Input.Keyboard.KeyCodes.CTRL,
    p: Phaser.Input.Keyboard.KeyCodes.P,
    start: Phaser.Input.Keyboard.KeyCodes.ENTER,
  });
}

function optionsMenuUpdate() {
  parentThis = this;
  menuCursor.update();
}