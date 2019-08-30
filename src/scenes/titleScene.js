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

  let gtArgs = [
    centerX, centerY-60, 'gameLogo'
  ];
  let gameTitle = this.add.image(...gtArgs);
  let sigArgs = [
    config.width-16, config.height-7, 'signature'
  ];
  let signature = this.add.image(...sigArgs);

  let mbIDs = [
    'playButton',
    'optionsButton',
    'scoresButton',
    'creditsButton',
    'quitButton'
  ];
  let sceneLaunchFuncDestinations = [
    'levelIntroScene',
    'optionsMenuScene',
    'scoresScene',
    'creditsScene'
  ];
  let mbFuncs = [
    ...sceneLaunchFuncDestinations.map(x => makeSceneLaunchCallback(x)),
    quitGame
  ];

  for (let i = 0; i < 5; i++) {
    // This is for creating the title's buttons.
    let currCons = createMenuButtonCons(
      mbIDs[((mbIDs.length - 1) + i) % mbIDs.length],
      mbIDs[(i + 1) % mbIDs.length]
    );
    let currFunc = mbFuncs[i];
    let text = mbIDs[i].match(/^[a-z]+/)[0];
    text = text[0].toUpperCase() + text.slice(1,);
    let args = [mbIDs[i], text, currFunc, centerY -4 + (i * 16), currCons];
    createMenuButtonCenterX(...args);
  }

  
  window.menuCursor = createSceneMenuCursor('playButton');

  // This creates the scene keybinds:
  cursors = this.input.keyboard.addKeys(keyBinds);
}

function titleUpdate() {
  parentThis = this;
  menuCursor.update();
}