let config = {
  type: Phaser.WEBGL,
  width: 320,
  height: 240,
  pixelArt: true,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: {y: 500},
      debug: false
    }
  },
  scene: [
    loadingScene, titleScene, levelIntroScene,
    mainScene, pausedScene, gameOverScene
  ]
};

// Global variables:

let centerX = config.width/2;
let centerY = config.height/2;
let coins;
let food;
let cursors;
let cursorsPaused;
let paused = false;
let parentThis;
let randBool = true;
let textObjects = {};  // Object for storing the displayed texts.
// Note that textObjects just serves as pointers to the letter image objects.
// Removing an key from it or reassigning letters in key's value 
// has no effect on the image objects. 
// To delete a single letter, use destroy().

// Becomes true if a destroyed zombie is detected in the zombies array:
let zombiesFilter = false;
// Array for storing alive zombies to be iterated over for movement:
let zombies = [];
let zombieUsedIDs = [];
let zombiesAlive = 0;
let zombieTimer;
let zombieSpawnpoints = [];
let totalScore = 0;

// Booleans for toggling features (or cheating lol):
let noAI = false;
let noTarget = false;
let spawnEnemies = true;
let skipTitle = false;
let showVisionRays = false;

// Global variables:

const game = new Phaser.Game(config);

function debuggingMenu() {
  // Constructor for creating a debug menu.
  let dbMenu = document.getElementById("debug-menu"); 
  this.getPlayerPos = () => {
    dbMenu.children[0].innerHTML = 'Player X: ' + Math.round(player.x*10)/10;
    dbMenu.children[1].innerHTML = 'Player Y: ' + Math.round(player.y*10)/10;
  };
}