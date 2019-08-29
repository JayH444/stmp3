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


  /* let playFunc = makeSceneLaunchCallback('levelIntroScene');
  let optionsFunc = makeSceneLaunchCallback('optionsMenuScene');
  let scoresFunc = makeSceneLaunchCallback('scoresScene');
  let creditsFunc = makeSceneLaunchCallback('creditsScene');
  let quitFunc = () => {
    nw.App.quit();
  };

  addMenuElementCenterX('Play', playFunc, 'playText', centerY - 4);
  addMenuElementCenterX('Options', optionsFunc, 'optionText', centerY + 12);
  addMenuElementCenterX('Scores', scoresFunc, 'scoresText', centerY + 28);
  addMenuElementCenterX('Credits', creditsFunc, 'creditsText', centerY + 44);
  addMenuElementCenterX('Quit', quitFunc, 'quitText', centerY + 60);*/
  
  // Button name abbreviation + Cons = The connections of that button
  // for the given keypresses.

  /*let pbCons = createMenuButtonCons('scoresButton', 'optionsButton');
  let playFunc = makeSceneLaunchCallback('levelIntroScene');
  createMenuButtonCenterX('playButton', 'Play', playFunc, centerY - 4, pbCons);*/

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