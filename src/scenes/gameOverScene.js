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
  totalScore = 0;
  setTimeout(() => {
    parentThis.scene.launch('titleScene');
    parentThis.scene.stop('gameOverScene');    
  }, 3000);
}

function gameOverUpdate() {
  parentThis = this;
}