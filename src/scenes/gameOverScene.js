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
  centerX = config.width/2;
  centerY = config.height/2;
  coins;
  food;
  cursors;
  cursorsPaused;
  paused = false;
  parentThis;
  randBool = true;
  for (let key in textObjects) {
    destroyText(key);
  }
  textObjects = {};

  zombiesFilter = false;
  zombies = [];
  zombieUsedIDs = [];
  zombiesAlive = 0;
  //zombieTimer;
  zombieSpawnpoints = [];
  pickupables = [];

  spawnEnemies = true;
  printTextCenter('Game Over', 'gameOverText', centerY-8);
  printTextCenter(`Final score: ${totalScore}`, 'finalScoreText', centerY+8);
  setTimeout(() => {
    parentThis.scene.launch('titleScene');
    parentThis.scene.stop('gameOverScene');    
  }, 3000);
}

function gameOverUpdate() {
  parentThis = this;
}