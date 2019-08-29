// Game over scene.

class gameOverScene extends Phaser.Scene {
  constructor() {
    super({key: 'gameOverScene'});
    this.preload = gameOverPreload;
    this.create = gameOverCreate;
    this.update = gameOverUpdate;
  }
}

function gameOverPreload() {
  parentThis = this;
}

function gameOverCreate() {
  parentThis = this;
  resetGlobalVars()
  printTextCenter('Game Over', 'gameOverText', centerY-8);
  printTextCenter(`Final score: ${totalScore}`, 'finalScoreText', centerY+8);
  /*totalScore = 0;
  setTimeout(() => {
    parentThis.scene.launch('titleScene');
    parentThis.scene.stop('gameOverScene');    
  }, 3000);*/

  let toTitle = makeSceneLaunchCallback('titleScene', 'gameOverScene');
  let returnFunc = () => {
    totalScore = 0;
    toTitle();
  };
  let cbArgs = [
    'continueButton', 'Continue', returnFunc, centerY + 72,
    createMenuButtonCons('saveButton', 'saveButton')
  ];
  createMenuButtonCenterX(...cbArgs);

  let saveFunc = makeSceneLaunchCallback('nameEnteringScene', 'gameOverScene');
  let ssbArgs = [
    'saveButton', 'Save Score', saveFunc, centerY + 56,
    createMenuButtonCons('continueButton', 'continueButton')
  ];
  createMenuButtonCenterX(...ssbArgs);

  window.menuCursor = createSceneMenuCursor('continueButton');
  // This creates the scene keybinds:
  cursors = this.input.keyboard.addKeys(keyBinds);

}

function gameOverUpdate() {
  parentThis = this;
  menuCursor.update();
}