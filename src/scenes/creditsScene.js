// Credits scene.

class creditsScene extends Phaser.Scene {
  constructor() {
    super({key: 'creditsScene'});
    this.preload = creditsPreload;
    this.create = creditsCreate;
    this.update = creditsUpdate;
  }
}

function creditsPreload() {
  parentThis = this;
}

function creditsCreate() {
  parentThis = this;
  printTextCenter('Programming & Game Design: Hexadecane', 'creditsText', centerY-24);
  printTextCenter('Art assets: surt', 'creditsText', centerY-8);
  printTextCenter('Created with Phaser 3', 'creditsText', centerY+16);

  let returnFunc = makeSceneLaunchCallback('titleScene', 'creditsScene');
  addMenuElementCenterX('Return', returnFunc, 'returnCreditText', centerY + 56);

  window.menuCursor = createSceneMenuCursor();

  // This creates the scene keybinds:
  cursors = this.input.keyboard.addKeys(keyBinds);
}

function creditsUpdate() {
  parentThis = this;
  menuCursor.update();
}