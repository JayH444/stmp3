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
    destroyMenuElements();
    parentThis.scene.launch('levelIntroScene');
    parentThis.scene.stop('titleScene');
  };
  let optionText = 'Options';
  let optionsFunc = () => {
    destroyMenuElements();
    parentThis.scene.launch('optionsMenuScene');
    parentThis.scene.stop('titleScene');
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

  // This creates the scene keybinds:
  cursors = this.input.keyboard.addKeys(keyBinds);
}

function titleUpdate() {
  parentThis = this;
  menuCursor.update();
}