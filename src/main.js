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
    loadingScene, titleScene, levelIntroScene, //keyBindingScene,
    mainScene, pausedScene, optionsMenuScene, gameOverScene
  ]
};

// -- Global variables: -- //

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

let menuElements = [];  // Array for storing menu elements.
// Elements are stored in their sequential order.

// Array used for storing and iterating over the alive enemies for their AI:
let enemiesAlive = [];
// Becomes true if a destroyed enemy is detected in the enemies array:
let enemiesFilter = false;
let spawnEnemies = true;

let totalEnemiesSpawned = 0;
let enemySpawnpoints = [];
let totalScore = 0;
let currentLevel;
let levelNumber = 0;
let lastLevelHealth = 3;
// Prevents the gameover conditional from executing more than once:
let gameOverTriggered = false;

// Booleans for toggling features (or cheating lol):
let noAI = false;
let noTarget = false;
let skipTitle = false;
let allowEnemySpawning = true;
let pauseGameTimer = false;
let showVisionRays = false;
let pickRandomLevel = false;
let canPause = true;

//

const game = new Phaser.Game(config);

function debuggingMenu() {
  // Constructor for creating a debug menu.
  let dbMenu = document.getElementById("debug-menu");
  this.getPlayerPos = () => {
    dbMenu.children[0].innerHTML = 'Player X: ' + Math.round(player.x*10)/10;
    dbMenu.children[1].innerHTML = 'Player Y: ' + Math.round(player.y*10)/10;
  };
}

function resetGlobalVars() {
  centerX = config.width/2;
  centerY = config.height/2;
  coins = undefined;
  food = undefined;
  cursors = undefined;
  cursorsPaused = undefined;
  paused = false;
  randBool = true;
  for (let key in textObjects) {
    destroyText(key);
  }
  textObjects = {};
  menuElements = [];

  totalEnemiesSpawned = 0;
  enemySpawnpoints = [];
  enemiesAlive = [];
  enemiesFilter = false;
  pickupables = [];
  currentLevel = undefined;
  levelNumber = 0;
  lastLevelHealth = 3;

  spawnEnemies = true;
  canPause = true;
}
