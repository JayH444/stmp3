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


  let playFunc = makeSceneLaunchCallback('levelIntroScene');
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
  addMenuElementCenterX('Quit', quitFunc, 'quitText', centerY + 60);

  
  window.menuCursor = createSceneMenuCursor();

  // This creates the scene keybinds:
  cursors = this.input.keyboard.addKeys(keyBinds);
}

function titleUpdate() {
  parentThis = this;
  menuCursor.update();
}