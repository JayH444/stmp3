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
  let creditsText1 = 'Programming, SFX, & Game Design:';
  printTextCenter(creditsText1, 'creditsText1', centerY-48);
  printTextCenter('Hexadecane', 'creditsText2', centerY-36);
  printTextCenter('Art assets:', 'creditsText3', centerY-16);
  printTextCenter('surt', 'creditsText4', centerY-4);
  printTextCenter('Created with Phaser 3', 'creditsText5', centerY+16);

  let returnFunc = makeSceneLaunchCallback('titleScene', 'creditsScene');
  createMenuButtonCenterX('returnButton', 'Return', returnFunc, centerY+72)

  window.menuCursor = createSceneMenuCursor('returnButton');
  // This creates the scene keybinds:
  cursors = this.input.keyboard.addKeys(keyBinds);
}

function creditsUpdate() {
  parentThis = this;
  menuCursor.update();
}