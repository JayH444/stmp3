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

  let setKeysText = 'Set Controls';
  let setKeysFunc = () => {
    destroyMenuElements();
    parentThis.scene.launch('keyBindingScene');
    parentThis.scene.stop('optionsMenuScene');
  };
  let returnText = 'Return';
  let returnFunc = () => {
    destroyMenuElements();
    parentThis.scene.launch('titleScene');
    parentThis.scene.stop('optionsMenuScene');
  };

  addMenuElementCenterX(setKeysText, setKeysFunc, 'setKeysText', centerY - 4);
  addMenuElementCenterX(returnText, returnFunc, 'returnText', centerY + 12);

  window.menuCursor = createSceneMenuCursor();

  // This creates the scene keybinds:
  cursors = this.input.keyboard.addKeys(keyBinds);
}

function optionsMenuUpdate() {
  parentThis = this;
  menuCursor.update();
}