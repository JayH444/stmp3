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

  let saveScoreFunc = () => {
    let name = 'TESTA';
    scores[name] = totalScore;
    let data = JSON.stringify(scores, null, 2);
    fs.writeFileSync('./root/dist/scores.json', data);
    totalScore = 0;
  }

  let toTitle = makeSceneLaunchCallback('titleScene', 'gameOverScene');
  let returnFunc = () => {
    totalScore = 0;
    toTitle();
  };
  addMenuElementCenterX('Continue', returnFunc, 'continueText', centerY+72);

  addMenuElementCenterX('Save Score', saveScoreFunc, 'saveScoreText', centerY+56);

  window.menuCursor = createSceneMenuCursor();
  // This creates the scene keybinds:
  cursors = this.input.keyboard.addKeys(keyBinds);

}

function gameOverUpdate() {
  parentThis = this;
  menuCursor.update();
}