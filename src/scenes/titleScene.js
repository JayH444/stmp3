// Title scene.

class titleScene extends Phaser.Scene {
  constructor() {
    super({key: 'titleScene'});
    this.preload = titlePreload;
    this.create = titleCreate;
    this.update = titleUpdate;
  }
}

function titlePreload() {
}

function titleCreate() {
  parentThis = this;

  let gameTitle = this.add.image(centerX, centerY-60, 'gameLogo');
  let signature = this.add.image(config.width-16, config.height-7, 'signature');

  let playText = 'Play';
  let playFunc = () => {
    parentThis.scene.launch('levelIntroScene');
    parentThis.scene.stop('titleScene');
    destroyMenuElements()
  };
  let optionText = 'Options';
  let optionsFunc = () => {
    parentThis.scene.launch('optionsMenuScene');
    parentThis.scene.stop('titleScene');
    destroyMenuElements()
  };
  let quitText = 'Quit';
  let quitFunc = () => {
    nw.App.quit();
  };

  addMenuElementCenterX(playText, playFunc, 'playText', centerY - 4);
  addMenuElementCenterX(optionText, optionsFunc, 'optionText', centerY + 12);
  addMenuElementCenterX(quitText, quitFunc, 'quitText', centerY + 28);

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

function titleUpdate() {
  parentThis = this;
  menuCursor.update();
}