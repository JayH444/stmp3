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

  let setKeysFunc = () => {
    destroyMenuButtons();
    parentThis.scene.launch('keyBindingScene');
    parentThis.scene.stop('optionsMenuScene');
  };
  let returnFunc = () => {
    destroyMenuButtons();
    parentThis.scene.launch('titleScene');
    parentThis.scene.stop('optionsMenuScene');
  };

  let setKeysButtonArgs = [
    'setkeysButton', 'Set Controls', setKeysFunc, centerY - 4,
    createMenuButtonCons('returnButton', 'returnButton')
  ];
  createMenuButtonCenterX(...setKeysButtonArgs);

  let returnButtonArgs = [
    'returnButton', 'Return', returnFunc, centerY + 12,
    createMenuButtonCons('setkeysButton', 'setkeysButton')
  ];
  createMenuButtonCenterX(...returnButtonArgs);

  window.menuCursor = createSceneMenuCursor('setkeysButton');

  // This creates the scene keybinds:
  cursors = this.input.keyboard.addKeys(keyBinds);
}

function optionsMenuUpdate() {
  parentThis = this;
  menuCursor.update();
}