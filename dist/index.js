'use strict';

// Credits scene.

class creditsScene extends Phaser.Scene {
  constructor() {
    super({key: 'creditsScene'});
    this.preload = creditsPreload;
    this.create = creditsCreate;
    this.update = creditsUpdate;
  }
}

function creditsPreload() {
  parentThis = this;
}

function creditsCreate() {
  parentThis = this;
  let creditsText1 = 'Programming, SFX, & Game Design:';
  printTextCenter(creditsText1, 'creditsText1', centerY-48);
  printTextCenter('Hexadecane', 'creditsText2', centerY-36);
  printTextCenter('Art assets:', 'creditsText3', centerY-16);
  printTextCenter('surt', 'creditsText4', centerY-4);
  printTextCenter('Created with Phaser 3', 'creditsText5', centerY+16);

  let returnFunc = makeSceneLaunchCallback('titleScene', 'creditsScene');
  createMenuButtonCenterX('returnButton', 'Return', returnFunc, centerY+72)

  window.menuCursor = createSceneMenuCursor('returnButton');
  // This creates the scene keybinds:
  cursors = this.input.keyboard.addKeys(keyBinds);
}

function creditsUpdate() {
  parentThis = this;
  menuCursor.update();
}


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


// Scene for binding the controls to the game.

class keyBindingScene extends Phaser.Scene {
  constructor() {
    super({key: 'keyBindingScene'});
    this.preload = keyBindingPreload;
    this.create = keyBindingCreate;
    this.update = keyBindingUpdate;
  }
}

function keyBindingPreload() {
  parentThis = this;
}

function keyBindingCreate() {
  parentThis = this;

  let keyBindIDs = Object.keys(keyBinds);

  let offset = 80;
  for (let i of keyBindIDs) {  // Makes all the menu buttons for the keys.
    // keyBinds hashtable key capitalized:
    let keyStr = i[0].toUpperCase()+i.slice(1,);
    let currID = i+'Button'
    // Text shown on the menu for the given key:
    let currText = `${keyStr}: ${codeKeys[keyBinds[i]]}`;
    let currFunc = () => {  
      // Function associated with the menu button for the keybind changer.
      // Menu cursor can't be used while changing a key:
      menuCursor.canUse = false;
      changeText(currID, `${keyStr}: ...`);
      let callback = (event) => {
        let oldKeyCode = keyBinds[i];
        keyBinds[i] = event.keyCode;
        parentThis.input.keyboard.removeKey(oldKeyCode);
        cursors = parentThis.input.keyboard.addKeys(keyBinds);
        changeText(currID, `${keyStr}: ${codeKeys[keyBinds[i]]}`);
        centerTextX(currID);
        parentThis.input.keyboard.removeListener('keydown');
        menuCursor.canUse = true;
      };
      parentThis.input.keyboard.on('keydown', callback);
    };
    createMenuButtonCenterX(currID, currText, currFunc, centerY - offset);
    offset -= 16;
  }

  let topBindButtonID = keyBindIDs[0]+'Button';
  let bottomBindButtonID = keyBindIDs[keyBindIDs.length-1]+'Button';

  // Code for creating the save and return button, and connecting them to
  // the top and bottom keybind button. (topBindButtonID & bottomBindButtonID)
  let saveFunc = () => {
    let fileToWrite = {};
    for (let key in keyBinds) {
      fileToWrite[key] = codeKeys[keyBinds[key]];
    }
    let data = JSON.stringify(fileToWrite, null, 2);
    fs.writeFileSync('./root/dist/keybinds.json', data);
  };
  let saveButtonArgs = [
    'saveButton', 'Save Controls', saveFunc, centerY + 64,
    createMenuButtonCons(bottomBindButtonID, 'returnButton')
  ];
  createMenuButtonCenterX(...saveButtonArgs)
  
  let returnFunc = () => {
    destroyMenuButtons();
    parentThis.scene.launch('optionsMenuScene');
    parentThis.scene.stop('keyBindingScene');
  };
  let returnButtonArgs = [
    'returnButton', 'Return', returnFunc, centerY + 80,
    createMenuButtonCons('saveButton', keyBindIDs[0]+'Button')
  ];
  createMenuButtonCenterX(...returnButtonArgs);

  addConsToMenuButton(topBindButtonID, true, 'returnButton');
  addConsToMenuButton(bottomBindButtonID, true, undefined, 'saveButton');

  // For loop for iterating over the bind buttons between first & last, and
  // creating their corresponding button input connections:
  let lastID;
  for (let i = 0; i < keyBindIDs.length; i++) {
    let currID = keyBindIDs[i]+'Button';
    let nextID = undefined;
    if (menuButtons[currID].up != undefined) {
      lastID = undefined;
    }
    if (menuButtons[currID].down == undefined) {
      nextID = keyBindIDs[i+1]+'Button';
    }
    addConsToMenuButton(currID, false, lastID, nextID);
    lastID = currID;
  }

  window.menuCursor = createSceneMenuCursor('returnButton');

  // This creates the scene keybinds:
  cursors = this.input.keyboard.addKeys(keyBinds);
}

function keyBindingUpdate() {
  parentThis = this;
  menuCursor.update();
}


// Level intro scene.

class levelIntroScene extends Phaser.Scene {
  constructor() {
    super({key: 'levelIntroScene'});
    this.preload = levelIntroPreload;
    this.create = levelIntroCreate;
    this.update = levelIntroUpdate;
  }
}

function levelIntroPreload() {
  parentThis = this;
  currentLevel = (pickRandomLevel) ? randomLevel() : levels[levelNumber];
}

function levelIntroCreate() {
  parentThis = this;
  let tilemapEntries = parentThis.cache.tilemap.entries.entries;
  let mapNameProperty = tilemapEntries[currentLevel].data.properties[0];
  let levelName = (mapNameProperty) ? mapNameProperty.value : currentLevel;
  printTextCenter(levelName, 'levelIntroText');
  setTimeout(() => {
    parentThis.scene.launch('mainScene');
    parentThis.scene.stop('levelIntroScene');    
  }, 1500);
}

function levelIntroUpdate() {
  parentThis = this;
}


// Loading screen scene.

class loadingScene extends Phaser.Scene {
  constructor() {
    super({key: 'loadingScene', active: true});
    this.preload = loadingPreload;
    this.create = loadingCreate;
    this.update = loadingUpdate;
  }
}

function setRect(rect, style, coords) {
  rect.clear();
  rect.fillStyle(...style);
  rect.fillRect(...coords);
}

function loadingPreload() {  // Loads game assets.
  parentThis = this;
  
  window.progressBox = this.add.graphics();
  window.progressBar = this.add.graphics();

  progressBox.fillStyle(0xbe2633, 1);
  progressBox.fillRect(centerX-50, centerY-10, 100, 20);

  this.load.on('progress', (value) => {
    // Increases the loading bar size as more assets are loaded.
    progressBar.clear();
    progressBar.fillStyle(0xffffff, 1);
    progressBar.fillRect(centerX-50, centerY-10, 100*value, 20);
  });

  window.loadingComplete = false;

  this.load.on('complete', () => {
    progressBox.destroy();
    progressBox = undefined;
    loadingComplete = true;
  });

  //Images and sound effects:
  window.fs = require('fs');  // File system module.

  let files = fs.readdirSync('./root/dist/assets');
  for (let file of files) {
    // Loop for loading the images in the assets directory.
    // Automatically names them.
    // !!!Ignores files with a 'spritesheet_' prefix!!!
    // Spritesheets need to be loaded separately.
    if (!/spritesheet/.test(file)) {
      let pattern = /(\w+)\.png/;
      this.load.image(file.match(pattern)[1], 'assets/' + file);
    }
  }

  // Font spritesheet. Uses ASCII values minus 32.
  this.load.spritesheet('fontmap', 'assets/spritesheet_font.png', 
    {frameWidth: 8, frameHeight: 8}
  );

  // Loads and automatically names the spritesheets
  for (let file of files) {
    if (/spritesheet/.test(file) && !/font/.test(file)) {
      let pattern = /spritesheet_(\w+)/;
      this.load.spritesheet(file.match(pattern)[1], 'assets/' + file,
        {frameWidth: 16, frameHeight: 16}
      );
    }
  }

  // Sound effect loader:
  files = fs.readdirSync('./root/dist/sfx');
  for (let file of files) {
    // Loop for loading the sounds in the sfx directory.
    // Automatically names them.
    // Uses \w+ just in case there's any weird sound file extensions:
    let pattern = /(\w+)\.\w+/;
    this.load.audio(file.match(pattern)[1], 'sfx/' + file);
  }

  // Level JSON loading:
  window.levels = loadLevelTilesheets();

  // Misc image loading:
  this.load.image('menuCursor', 'assets/menu_cursor.png');
  this.load.image('gameLogo', 'assets/game_logo.png');
  this.load.image('tiles', 'assets/game_tiles.png');

  // Keybinds loading from JSON file:
  window.kbDir = './root/dist/keybinds.json';
  window.keyBinds = JSON.parse(fs.readFileSync(kbDir));
  for (let key in keyBinds) {
    keyBinds[key] = Phaser.Input.Keyboard.KeyCodes[keyBinds[key]];
  }

  // Scores loading from JSON file:
  window.scoresDir = './root/dist/scores.json';
  window.scores = JSON.parse(fs.readFileSync(scoresDir));
}

function loadingCreate() {
}

function loadingUpdate() {
  parentThis = this;

  if (loadingComplete) {
    // When the asset loading is complete, fade the loading bar out and
    // launch the title OR launch the main scene if skipTitle is true.
    let colors = [0xb2dcef, 0x31a2f2, 0x005784, 0x1b2632, 0x000000];
    for (let i = 0; i < colors.length; i++) {
      let timeoutArg = () => {
        setRect(progressBar, [colors[i], 1], [centerX-50, centerY-10, 100, 20])
      }; 
      setTimeout(timeoutArg, 33*(i+1));
    }
    let launchTitle = () => {
      if (!skipTitle) {
        parentThis.scene.launch('titleScene');
      }
      else {
        parentThis.scene.launch('mainScene');
      }
      parentThis.scene.stop('loadingScene');
    }
    setTimeout(launchTitle, 300);
    loadingComplete = false;
  };
}


// Main game scene and game loop.

class mainScene extends Phaser.Scene {
  constructor() {
    super({key: 'mainScene'});
    this.preload = preload;
    this.create = create;
    this.update = update;
  }
}


function preload() {
  parentThis = this;
  if (skipTitle) {
    currentLevel = (pickRandomLevel) ? randomLevel() : levels[levelNumber];
  }
}


function create() {
  parentThis = this;

  this.bg = this.add.tileSprite(0, 0, 800, 600, 'sky');

  // Level creation stuff:

  window.punchboxes = this.physics.add.staticGroup();
  window.edgeNodes = this.physics.add.staticGroup();
  window.grass = this.physics.add.staticGroup();

  window.map = parentThis.make.tilemap({key: currentLevel});
  window.tiles = map.addTilesetImage('gameTiles', 'tiles');
  window.platforms = map.createDynamicLayer('background', tiles, -16, 0);
  platforms.setCollisionByProperty({collides: true});

  // Entity creation code:

  window.validItemSpawnAreas = getValidItemSpawnAreas();
  window.validGrassSpawnAreas = getValidGrassSpawnAreas();

  for (let area of validGrassSpawnAreas) {  // Generates random grass.
    let ranSprite = pickRandomSprite(['grass1', 'grass2']);
    grass.create(area[0], area[1], ranSprite);
  }

  for (let i of map.objects[0].objects) {  // Creates the map entities/objects.
    if (window.hasOwnProperty(i.properties[0].value)) {
      window[i.properties[0].value](i.x-16, i.y-8);
    }
    else {
      console.log(`Unknown level function ${i.properties[0].value}.`);
    }
  }

  //

  let playerArgs = [parentThis, centerX, config.height-32, 'player', 160];
  window.player = new Player(...playerArgs);
  player.score = totalScore;
  player.setHealth(lastLevelHealth);

  // Game enemy manager:
  window.gameEnemyManager = new EnemyManagerClass();
  // Game timer:
  window.gameTimer = new gameTimerClass(gameEnemyManager);

  // Game topbar text:
  let scoreX = 8;
  printText('SCORE:', scoreX, 8, 'scoreText');
  printText(player.getScore(), scoreX + 48, 8, 'playerScore');
  let foesX = 130;
  printText('FOES:', foesX, 8, 'foesText');
  printText(gameEnemyManager.getEnemyCountText(), foesX + 40, 8, 'foesLeft');
  let timeX = 212;
  printText('TIME:', timeX, 8, 'timeText');
  printText(gameTimer.getTimeRemaining(), timeX + 40, 8, 'timeRemaining');
  gameTimer.startTimer();

  // This creates the scene keybinds:
  cursors = this.input.keyboard.addKeys(keyBinds);

  // Enemy spawn timer:

  function createRandomEnemy() {
    let condB = totalEnemiesSpawned < gameEnemyManager.initialEnemyCount;
    if (enemiesAlive.length <= 9 && condB) {
      totalEnemiesSpawned++;
      let options = [
        CreateRandomZombie, CreateRandomAcidBug, CreateRandomBat
      ];
      return options[Math.floor(Math.random() * options.length)]();
    }
  }

  let timerArgs = {delay: 3000, callback: createRandomEnemy, repeat: -1};
  window.enemySpawnTimer = this.time.addEvent(timerArgs);

  // Pickupables:

  coins = this.physics.add.group();
  coins.setDepth(0, 0);

  mixinPickupableMethods(coins, 'coin', 5000);

  let csArgs = {delay: 15000, callback: coins.spawnRandom, repeat: -1};
  let coinSpawner = this.time.addEvent(csArgs);


  // Food spawning:
  food = this.physics.add.group();
  food.setDepth(0, 0);

  mixinPickupableMethods(food, 'burger', 10000)

  food.pickup = (player, foodItem) => {
    player.addHealth();
    soundManager.play('gethealth');
    food.remove(foodItem, true, true);
  }

  food.spawn = (posX, posY) => {
    let foodList = ['burger', 'hotdog', 'chicken', 'sandwich'];
    food.create(posX, posY, pickRandomSprite(foodList));
    let lastInst = food.children.entries[food.children.entries.length-1];
    lastInst.setDepth(1);
    let destroy = () => {
      food.remove(lastInst, true, true);
    }
    parentThis.time.delayedCall(10000, destroy);
  }

  function pickupableTimer () {
    food.spawnRandom();
    let resetArgs = {
      delay: Phaser.Math.Between(15000, 30000),
      callback: pickupableTimer,
      callbackScope: this,
      repeat: 1
    };
    foodSpawner.reset(resetArgs);
  };

  let fsArgs = {
    delay: 3000,
    callback: pickupableTimer,
    callbackScope: this
  };

  let foodSpawner = this.time.addEvent(fsArgs);
  
  for (let p of pickupables) {
    parentThis.physics.add.collider(p, platforms);
    this.physics.add.overlap(player, p, p.pickup, null, parentThis);
  }

  let defaultLineStyle = {lineStyle: {width: 1, color: 0xFF0000}};
  parentThis.graphics = parentThis.add.graphics(defaultLineStyle);
}


function update() {
  parentThis = this;

  if (canPause) {
    if (Phaser.Input.Keyboard.JustDown(cursors.p) && !paused) {
      paused = true;
      this.scene.launch('pausedScene');
      this.scene.pause('mainScene');
    } 
    else {
      this.scene.resume('mainScene');
    }
  }

  if (!spawnEnemies && enemySpawnTimer.paused == false) {
    enemySpawnTimer.paused = true;
  }
  else if (spawnEnemies && enemySpawnTimer.paused == true) {
    enemySpawnTimer.paused = false;
  }

  if (!allowEnemySpawning) {
    spawnEnemies = false;
  }
  if (pauseGameTimer) {
    gameTimer.timerEvent.paused = true;
  }

  if (!player.alive && gameTimer.timeRemaining > 0 && !gameOverTriggered) {
    // Trigger game over.
    canPause = false;
    gameTimer.timerEvent.paused = true;
    totalScore = player.score;
    setTimeout(() => {
      parentThis.scene.launch('gameOverScene');
      parentThis.scene.stop('mainScene');
    }, 1500);
    gameOverTriggered = true;
  }

  player.update();

  parentThis.graphics.clear(); // Clears the last graphics drawn.

  // Monster stuff:

  enemiesAlive.forEach((enemy) => {
    if (enemy.destroyed) {
      enemiesFilter = true;
    } else {
      enemy.move(player);
    }
    if (enemy.alive && showVisionRays) {
      parentThis.graphics.strokeLineShape(enemy.lineOfSight);
    }
  });

  
  if (enemiesFilter) {
    // Cleanup for dead enemies in the enemies array.
    enemiesAlive = enemiesAlive.filter(x => x.destroyed == false);
    enemiesFilter = false;
  }

  //

}


// Name entering scene.

class nameEnteringScene extends Phaser.Scene {
  constructor() {
    super({key: 'nameEnteringScene'});
    this.preload = nameEnteringPreload;
    this.create = nameEnteringCreate;
    this.update = nameEnteringUpdate;
  }
}

function nameEnteringPreload() {
  parentThis = this;
}

function nameEnteringCreate() {
  parentThis = this;

  let letterFunc = (L) => {
    if (enteredName.length < 5) {
      enteredName += L;
      let displayed = enteredName;
      changeText('enteredName', displayed.padEnd(5, '_'));
    }
  };
  let kb = [
    'abcdef',
    'ghijkl',
    'mnopqr',
    'stuvwx',
    'yz0123',
    '456789'
  ];
  let offsetY = 72;
  for (let row of kb) {
    let offsetX = 110;
    for (let L of row) {
      let LU = L.toUpperCase();
      createMenuButton(L+'Button', LU, () => letterFunc(LU), offsetX, offsetY);
      offsetX += 20;
    }
    offsetY += 16;
  }
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 6; j++) {
      let currCons = [...Array(4)];
      // Conditional statements for the button connections:

      // Up
      if (i == 0) {
        // If on the first row, connect to the return button for moving up.
        currCons[0] = 'returnButton';
      }
      else {
        currCons[0] = kb[i-1][j]+'Button';
      }

      // Down
      if (i == 5) {
        // If on the last row, connect to the clear
        // and submit buttons below for moving down.
        currCons[1] = (j < 3) ? 'submitButton' : 'eraseButton';
      }
      else {
        currCons[1] = kb[i+1][j]+'Button';
      }

      // Left
      if (j == 0) {
        currCons[2] = kb[i][5]+'Button';
      }
      else {
        currCons[2] = kb[i][j-1]+'Button';
      }

      // Right
      if (j == 5) {
        currCons[3] = kb[i][0]+'Button';
      }
      else {
        currCons[3] = kb[i][j+1]+'Button';
      }

      addConsToMenuButton(kb[i][j]+'Button', true, ...currCons);
    }
  }

  printTextCenter('Enter a name:', 'nameEnteringTitle', 16);
  
  printTextCenter(enteredName.padEnd(5, '_'), 'enteredName', 48);

  let eraseButtonFunc = () => {
    enteredName = enteredName.slice(0, enteredName.length-1);
    let displayed = enteredName;
    changeText('enteredName', displayed.padEnd(5, '_'));
  }
  let eraseButtonArgs = [
    'eraseButton', 'Erase', eraseButtonFunc, 32, centerY + 56,
    createMenuButtonCons(
      '8Button',
      'returnButton',
      'submitButton',
      'submitButton'
    )
  ];
  createMenuButtonOffsetCenterX(...eraseButtonArgs);

  let submitButtonFunc = () => {
    console.log(totalScore);
    if (enteredName.length == 5) {
      if (scores.hasOwnProperty(enteredName)) {
        scores[enteredName] = totalScore;
      }
      else {
        let minScoreName = null;
        for (let name in scores) {
          if (minScoreName == null || scores[name] < scores[minScoreName]) {
            minScoreName = name;
          }
        }
        console.log(`Replacing ${minScoreName}...`);
        delete scores[minScoreName];
        scores[enteredName] = totalScore;
        let data = JSON.stringify(scores, null, 2);
        fs.writeFileSync('./root/dist/scores.json', data);
      }
      totalScore = 0;
      enteredName = '';
    }
    makeSceneLaunchCallback('scoreSubmittedScene', 'nameEnteringScene')();
  }
  let submitButtonArgs = [
    'submitButton', 'Submit', submitButtonFunc, -32, centerY + 56,
    createMenuButtonCons(
      '5Button',
      'returnButton',
      'eraseButton',
      'eraseButton'
    )
  ];
  createMenuButtonOffsetCenterX(...submitButtonArgs);

  let returnButtonArgs = [
    'titleScene', 'nameEnteringScene', centerY + 72,
    createMenuButtonCons(
      'submitButton',
      'aButton'
    )
  ];
  createReturnButtonCenterX(...returnButtonArgs);
  changeMenuButtonText('returnButton', 'Cancel & Return');
  centerMenuButtonTextX('returnButton');

  window.menuCursor = createSceneMenuCursor('returnButton');

  // This creates the scene keybinds:
  cursors = this.input.keyboard.addKeys(keyBinds);
}

function nameEnteringUpdate() {
  parentThis = this;
  menuCursor.update();
}


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


// Scene for when the game is paused.

class pausedScene extends Phaser.Scene {
  constructor() {
    super({key:'pausedScene'});

    this.preload = function() {
    };

    this.create = function() {
      printText('PAUSED', centerX-20, centerY, 'pauseText');
      // This creates the scene keybinds:
      cursorsPaused = this.input.keyboard.addKeys(keyBinds);
    };

    this.update = function() {
      let curP = cursorsPaused;
      if (curP.a.isDown && curP.b.isDown && curP.down.isDown) {
        parentThis.scene.launch('titleScene');
        parentThis.scene.stop('mainScene');
        parentThis.scene.stop('pausedScene');
        totalScore = 0;
        resetGlobalVars();
      }
      if (Phaser.Input.Keyboard.JustDown(curP.p) && paused) {
        destroyText('pauseText');
        paused = false;
        cursors.up.isDown = false;
        cursors.down.isDown = false;
        cursors.left.isDown = false;
        cursors.right.isDown = false;
        cursors.a.isDown = false;
        cursors.b.isDown = false;
        cursors.p.isDown = false;
        this.scene.resume('mainScene');
        this.scene.pause('pausedScene');
      }
    };
  }
}


// Scores scene.

class scoresScene extends Phaser.Scene {
  constructor() {
    super({key: 'scoresScene'});
    this.preload = scoresPreload;
    this.create = scoresCreate;
    this.update = scoresUpdate;
  }
}

function scoresPreload() {
  parentThis = this;
}

function scoresCreate() {
  parentThis = this;

  let offset = -56;
  let scoresKeys = [...Object.keys(scores)]
  let scoresKeysSorted = scoresKeys.sort((a, b) => scores[b] - scores[a]);
  for (let score of scoresKeysSorted) {
    let entry = `${score}: ${scores[score].toString().padStart(12, '-')}`
    printTextCenter(entry, score+'playerScore', centerY + offset);
    offset += 12;
  }

  let returnFunc = makeSceneLaunchCallback('titleScene', 'scoresScene');
  createMenuButtonCenterX('returnButton', 'Return', returnFunc, centerY+72);

  window.menuCursor = createSceneMenuCursor('returnButton');

  // This creates the scene keybinds:
  cursors = this.input.keyboard.addKeys(keyBinds);
}

function scoresUpdate() {
  parentThis = this;
  menuCursor.update();
}


// Score submitted scene.

class scoreSubmittedScene extends Phaser.Scene {
    constructor() {
      super({key: 'scoreSubmittedScene'});
      this.preload = scoreSubmittedPreload;
      this.create = scoreSubmittedCreate;
      this.update = scoreSubmittedUpdate;
    }
  }
  
  function scoreSubmittedPreload() {
    parentThis = this;
  }
  
  function scoreSubmittedCreate() {
    parentThis = this;
    printTextCenter('Score submitted!', 'scoreSubmittedText');
    setTimeout(() => {
      parentThis.scene.launch('titleScene');
      parentThis.scene.stop('scoreSubmittedScene');    
    }, 1500);
  }
  
  function scoreSubmittedUpdate() {
    parentThis = this;
  }


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


function resetGlobalVarsForLevelAdvance(willAdvance=true) {
  let nextLevel = levelNumber;
  let nextLevelHealth = player.health;
  if (nextLevel < levels.length-1 && willAdvance == true) nextLevel++;
  resetGlobalVars()
  levelNumber = nextLevel;
  lastLevelHealth = nextLevelHealth;
}

function completeLevel(willAdvance=true) {
  canPause = false;
  if (!textObjects.hasOwnProperty('levelClearedText')) {
    printTextCenter('Level cleared!', 'levelClearedText');
  }
  setTimeout(() => {
    parentThis.scene.launch('levelIntroScene');
    parentThis.scene.stop('mainScene');
    resetGlobalVarsForLevelAdvance(willAdvance);
  }, 3000);
}


// Math-related functions.

function calculateDistance(target1x, target1y, target2x, target2y) {
  // Calculates the absolute distance between two targets.
  let deltaXSquared = Math.pow(Math.abs(target1x - target2x), 2);
  let deltaYSquared = Math.pow(Math.abs(target1y - target2y), 2);
  return Math.round(Math.sqrt(deltaXSquared + deltaYSquared));
}

function pickRandomSprite(arr) {
  return Phaser.Math.RND.pick(arr);
}


function addMenuButtonObject(buttonObj) {
  // A button object has the following properties:
  // id, text, func, x, y, and its connections for a given key press.
  // (e.g. up)
  menuButtons[buttonObj.id] = buttonObj;
  printText(buttonObj.text, buttonObj.x, buttonObj.y, buttonObj.id);
}

function createMenuButton(id, text, func, x, y, connections) {
  // Shorthand function for quickly creating a menu button.
  let mbObject = {
    id: id,
    text: text,
    func: func,
    x: x,
    y: y,
  };
  for (let c in connections) {
    mbObject[c] = connections[c];
  }
  addMenuButtonObject(mbObject);
}

function createMenuButtonCenterX(id, text, func, y, cons) {
  let x = centerX - (text.length*8/2) + 4;
  createMenuButton(id, text, func, x, y, cons);
}

function createMenuButtonOffsetCenterX(id, text, func, xOffset, y, cons) {
  let x = (centerX - (text.length*8/2) + 4) + xOffset;
  createMenuButton(id, text, func, x, y, cons);
}

function createMenuButtonCons(up, down, left, right) {
  return {up: up, down: down, left: left, right: right};
}

function addConsToMenuButton(id, override=true, up, down, left, right) {
  let newCons = {up: up, down: down, left: left, right: right};
  for (let c in newCons) {
    if ((!override && menuButtons[id][c] == undefined) || override) {
      menuButtons[id][c] = newCons[c];
    }
  }
}

function changeMenuButtonText(id, newText) {
  menuButtons[id].text = newText;
  changeText(id, newText);
}

function centerMenuButtonTextX(id) {
  centerTextX(id);
  menuButtons[id].x = textObjects[id][0].x;
}

function destroyMenuButtons() {
  // Destroys the contents of the menuButtons object.
  // todo...
  for (let i in menuButtons) {
    destroyText(menuButtons[i].id);
    delete menuButtons[i];
  }
}

function createReturnButton(newSceneName, oldSceneName, x, y, cons) {
  let returnFunc = makeSceneLaunchCallback(newSceneName, oldSceneName);
  createMenuButton('returnButton', 'Return', returnFunc, x, y, cons)
}

function createReturnButtonCenterX(newSceneName, oldSceneName, y, cons) {
  createReturnButton(newSceneName, oldSceneName, centerX - (24) + 4, y, cons);
}

function makeSceneLaunchCallback(newSceneName, oldSceneName='titleScene') {
  // Basically makes the callback used for launching a new scene, deleting
  // the current scene's menu elements, and stopping the current scene.
  return () => {
    menuCursor.destroy();
    destroyMenuButtons();
    destroyAllText();
    parentThis.scene.launch(newSceneName);
    parentThis.scene.stop(oldSceneName);
  };
}

function createSceneMenuCursor(startingButtonId) {
  let menuCursorArgs = [
    parentThis,
    menuButtons[startingButtonId].x,
    menuButtons[startingButtonId].y,
    'menuCursor',
    startingButtonId
  ];
  return new menuCursorClass(...menuCursorArgs);
}


// Functions for image-based text creation

function printText(str, x, y, id) {
  // Prints a text element to the scene and puts it in the textObjects array.
  let offset = x;
  let wordImages = [];
  for (let letter of str) {
    let charCode = letter.charCodeAt(0) - 32;
    let curr = parentThis.add.image(offset, y, 'fontmap', charCode);
    curr.setDepth(1);
    wordImages.push(curr);
    offset += 8;  // Offset for each respective letter.
  }
  textObjects[id] = wordImages;
}

function printTextCenter(str, id, y=centerY-4) {
  printText(str, centerX - (str.length*8/2) + 4, y, id);
}

function changeText(textId, newText) {
  // General function for changing text. E.g. change 'banana' to 'cool guy'.
  if (newText.length === 0) {
    console.log('Cannot change text object length to zero.')
    return;
  }
  let currText = textObjects[textId];
  let x = currText[0].x;
  let y = currText[0].y;
  for (let i of currText) {
    i.destroy();
  }
  textObjects[textId] = [];
  currText = textObjects[textId];
  for (let i in newText) {
    let charCode = newText.charCodeAt(i) - 32;
    let l = parentThis.add.image(x, y, 'fontmap', charCode)
    currText.push(l);
    x += 8;
  }
}

function centerTextX(textId) {
  let textLength = textObjects[textId].length;
  let offset = centerX - (textLength*8/2) + 4;
  for (let letter of textObjects[textId]) {
    letter.x = offset;
    offset += 8;
  }
}

function updateText(textId, getText) {
  // General function for updating text. More performance-friendly than 
  // changeText(). This CANNOT alter the length of text!!! 
  // Use "changeText" for that instead.
  // getText referrs to the 'get' method for the given text, 
  // e.g. player.getScore, gameTimer.getTimeRemaining, etc.
  let newText = getText();
  textObjects[textId].forEach((img, i) => {
    img.setTexture('fontmap', newText.charCodeAt(i) - 32);
  });
}

function destroyText(textId) {
  // Removes a text element.
  for (let i of textObjects[textId]) {
    i.destroy();
  }
  textObjects[textId] = undefined;
  delete textObjects[textId];
}

function destroyAllText() {
  // Removes and destroys ALL text elements in the textObjects array.
  for (let key in textObjects) {
    destroyText(key);
  }
}


class EnemyManagerClass {
  constructor(enemyCountMinimum=12, enemyCountRange=13) {
    let ecm = enemyCountMinimum;
    let ecr = enemyCountRange;
    this.initialEnemyCount = Math.floor(Math.random()*ecr + ecm);
    this.currentEnemyCount = this.initialEnemyCount;
    this.decrement = this.decrement.bind(this);
    this.getEnemyCountText = this.getEnemyCountText.bind(this);
  }
  getEnemyCountText() {
    return this.currentEnemyCount.toString().padStart(3, '0');
  }
  decrement() {
    if (this.currentEnemyCount > 0) {
      this.currentEnemyCount--;
      updateText('foesLeft', this.getEnemyCountText);
    }
  }
}


class gameTimerClass {
  // Class for the game timer and its properties and methods.
  // enemyManager is passed in as the argument to keep track of the number of
  // enemies alive, which is used for the timer's win/lose state.
  constructor(enemyManager) {
    this.timeRemaining = 150;
    this.timerEvent;
    this.getTimeRemaining = () => {
      return this.timeRemaining.toString().padStart(3, '0');
    };
    this.resetTime = () => {
      this.timeRemaining = 150;
    };
    this.tickTimer = () => {
      if (enemyManager.currentEnemyCount > 0) {
        this.timeRemaining--;
      }
      else {
        this.timerEvent.paused = true;
        totalScore = player.score;
        completeLevel()
      }
      if (this.timeRemaining === 0) {
        if (enemyManager.currentEnemyCount > 0) {
          player.die();
          spawnEnemies = false;
          this.timerEvent.paused = true;
          totalScore = player.score;
          setTimeout(() => {
            parentThis.scene.launch('gameOverScene');
            parentThis.scene.stop('mainScene');
          }, 1500);
        }
        else {
          this.resetTime();
        }
      }
      updateText('timeRemaining', this.getTimeRemaining);
    };
    this.startTimer = () => {
      let gameTimerEventArgs = {
        delay: 1000, callback: this.tickTimer, repeat: -1
      };
      this.timerEvent = parentThis.time.addEvent(gameTimerEventArgs);
    };
  }
}


function loadLevelTilesheets() {
  // Loads the level tilesheets of the game in the "levels" folder, and
  // returns an array of the keys for the levels.
  let files = fs.readdirSync('./root/dist/levels');
  let res = [];
  for (let file of files) {
    // fileKey is basically the file name:
    let fileKey = file.match(/(\w+)\.json/)[1];
    parentThis.load.tilemapTiledJSON(
      fileKey,
      `levels/${file}`
    );
    res.push(fileKey);
  }
  return res;
}

function randomLevel() {
  return levels[Math.floor(Math.random()*levels.length)];
}

function createEdgeNode(x, y) {
  edgeNodes.create(x, y, 'edgenode');
}


function createEnemySpawn(x, y) {
  enemySpawnpoints.push([x, y]);
}

function createZombieSpawn(x, y) {
  createEnemySpawn(x, y);
}

function getValidItemSpawnAreas() {
  let res = [];
  for (let row of map.layers[0].data.slice(1,)) {
    for (let i in row) {
      let tile = row[i]
      let tileAboveIsEmpty = map.layers[0].data[tile.y-1][i].index == -1;
      let tileOnScreen = tile.x > 0 && tile.x < 21;
      if ([1, 2].includes(tile.index) && tileAboveIsEmpty && tileOnScreen) {
        // 1 and 2 are the ground and ground w/ grass tiles.
        res.push([tile.x*16 - 8, (tile.y-1)*16 + 8]);
      }
    }
  }
  return res;
}

function getValidGrassSpawnAreas() {
  let res = [];
  for (let row of map.layers[0].data) {
    for (let tile of row) {
      let tileOnScreen = tile.x > 0 && tile.x < 21;
      if (tile.index === 2 && tileOnScreen) {
        res.push([tile.x*16 - 8, (tile.y-1)*16 + 8]);
      }
    }
  }
  return res;
}



// Class and methods for the menu cursor.

class menuCursorClass extends Phaser.GameObjects.Image {
  constructor(scene, x, y, texture, startingButtonId, frame) {
    super(scene, x, y, texture, frame);
    this.buttonSelected = startingButtonId;
    // buttonSelected will be the ID of the menu button it is currently on.
    // This ID is also equivalent to the textobject ID of the text 
    // associated with the button.
    this.canUse = true;
    let directions = ['up', 'down', 'left', 'right'];
    this.update = () => {
      if (this.canUse) {
        let lastButtonXCoord = textObjects[this.buttonSelected][0].x - 10;
        if (lastButtonXCoord != this.x) {
          this.x = lastButtonXCoord;
        }
        // lastButtonXCoord is for when the text of the currently selected
        // button changes. If the X coordinate of the leftmost letter minus 10
        // (cursor offset) does not equal the current cursor coord, then
        // it will update it.
        for (let dir of directions) {
          if (Phaser.Input.Keyboard.JustDown(cursors[dir])) {
            if (Boolean(menuButtons[this.buttonSelected][dir])) {
              this.buttonSelected = menuButtons[this.buttonSelected][dir];
              //console.log('The current button selected is:');
              //console.log(menuButtons[this.buttonSelected]);
              this.x = menuButtons[this.buttonSelected].x - 10;
              this.y = menuButtons[this.buttonSelected].y;
            }
          }
        }
        let startDown = Phaser.Input.Keyboard.JustDown(cursors.start);
        let aDown = Phaser.Input.Keyboard.JustDown(cursors.a);
        if (startDown || aDown) {
          menuButtons[this.buttonSelected].func();
        }
      }
    };
    scene.add.existing(this);
  }
}


// Class and methods for the sound manager.
// This is mainly for preventing multiple sounds playing 
// and "overlapping" simultaneously, in order to prevent earrape.
// E.g. Punching and getting hit simultaneously, or 
// head-stomping multiple enemies simultaneously.

class soundManagerClass {
  constructor() {
    this.play = (sound) => {
      for (let i of parentThis.sound.sounds) {
        if (sound === i.key) {
          i.stop();
          i.destroy();
        }
      }
      parentThis.sound.play(sound);
    }
  }
}


class Actor extends Phaser.Physics.Arcade.Sprite {
  // Constructor function "class" for creating an actor 
  // and its general methods and properties.
  constructor(scene, x, y, texture, speed, name=texture, animPlaySpeed=speed) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);
    this.name = name;
    this.body.setGravity(0, 500);
    this.body.setSize(8, 16);
    this.drag = 0.25;
    this.velocityDecay = 0.5;
    this.speed = speed;
    this.alive = true;
    this.health = 3;
    this.stunned = false;
    this.invul = false;
    this.flickerTimer = 0;
    this.destroyed = false;
    // Invulnerability period after getting hit (in ms):
    this.invulPeriod = 1500;
    // Animation speed scales with actor's movement speed,
    // OR with a predefined value:
    this.animSpeed = parseInt(0.09375 * animPlaySpeed);
    parentThis.physics.add.collider(this, platforms);

    // Methods:

    this.goIdle = (arg) => {
      this.decayVelocityX(arg);
      this.anims.play(this.name + 'Idle');
    }

    this.decayVelocityX = (arg=0.5) => {  // Actor velocity decay from drag.
      if (this.destroyed) return;
      let decayRatio = arg;
      if (!this.body.blocked.down) {
        decayRatio *= 1.75;
      }
      this.body.velocity.x = parseInt(this.body.velocity.x * decayRatio);
    }

    this.moveDir = (speed, inertia, dir) => {
      if (this.destroyed) return;
      if (!this.stunned) {
        if (Math.abs(this.body.velocity[dir]) < Math.abs(speed)) {
          this.body.velocity[dir] += (speed * inertia);
        }
        else {
          this.body.velocity[dir] = speed;
        }
      }      
    }

    this.moveX = (speed, inertia) => {
      this.moveDir(speed, inertia, 'x');
    }

    this.moveY = (speed, inertia) => {
      this.moveDir(speed, inertia, 'y');    
    }

    this.die = () => {
      this.visible = true;
      this.alive = false;
      this.health = 0;
      this.anims.play(this.name + 'Die');
      if (Boolean(this.collider)) {
        this.collider.destroy();
      }
      if (Boolean(this.collision)) {
        this.collision.destroy();
      }
      parentThis.time.delayedCall(1000, () => this.destroyed = true);
      parentThis.time.delayedCall(5000, () => this.destroy());
    }

    this.stun = (time, invulnerable=false) => {
      this.stunned = true;
      parentThis.time.delayedCall(time, () => this.stunned = false);
      if (invulnerable) {
        parentThis.time.delayedCall(50, () => this.invul = true);
        let a = [this.invulPeriod, () => this.invul = false]
        parentThis.time.delayedCall(...a);
      }
    }
  
    this.flicker = () => {
      if (this.flickerTimer == 0) {
        this.visible = !this.visible;
        this.flickerTimer = 4;
      } else {
        this.flickerTimer--;
      }
    }
  
    this.playSoundPunch = () => {
      soundManager.play('punch1');
    }

    this.getHitByProjectile = (target, projectile) => {
      if (!target.invul && target.alive) {
        // target can't get hit if it is invulnerable
        target.setVelocityY(-150);
        if (!target.stunned) {
          // Stuns target so they can't move and don't take further damage.
          this.playSoundPunch();
          target.decrementHealth();
        }
        target.stun(200, true);
        let velocity = 100;
        if (target.body.velocity.x < 0) {
          // target is moving left...
          target.body.velocity.x = velocity;
        }
        else if (target.body.velocity.x > 0) {
          // target is moving right...
          target.body.velocity.x = -velocity;
        }
        else {
          // e.g. if target is standing still
          // and the projectile hits it.
          let dir = (projectile.body.velocity.x > 0) ? velocity : -velocity;
          target.body.velocity.x = dir;
        }
        if (target.health <= 0) {
          target.body.velocity.x *= -1;
          target.die();
        }
      }
      projectile.destroy();
    }
  
    this.getHit = (target1, target2) => {
      // Function that executes when collision 
      // between target1 and target2 occurs.
      if (!target1.alive || !target2.alive) return;
      if (target2.body.touching.up) {
        // target1 is above target2 (headstomp)
        this.playSoundPunch();
        if (target1.hasOwnProperty('addScore')) {
          target1.addScore(100);
        }
        if (target1.hasOwnProperty('addKill')) {
          target1.addKill();
        }
        parentThis.physics.world.removeCollider(target2.punchCollider);
        target2.die();
        target1.setVelocityY(-250);
      } 
      else {
        if (!target2.stunned && !target1.invul && !target1.punchAnimPlay) {
          // target1 can't get hit if target2 is stunned, 
          // or if target1 is invulnerable
          target1.setVelocityY(-150);
          if (!target1.stunned) {
            // Stuns target1 so they can't move and don't take further damage.
            this.playSoundPunch();
            target1.decrementHealth();
          }
          target1.stun(200, true);
          let velocity = 400;
          if (target1.body.velocity.x < 0) {
            // target1 is moving left...
            target1.body.velocity.x = velocity;
          }
          else if (target1.body.velocity.x > 0) {
            // target1 is moving right...
            target1.body.velocity.x = -velocity;
          }
          else {
            // e.g. if target1 is standing still
            // and target2 walks into them.
            // Throws target1 back.
            target1.body.velocity.x = (target2.flipX) ? velocity : -velocity;
          }
          if (target1.health <= 0) {
            target1.body.velocity.x *= -1;
            target1.die();
          }
        }
      }
    }
  
    if (!parentThis.anims.get(this.name + 'Move')) {
      // If the animation object doesn't already 
      // contain these animations, create them.
      parentThis.anims.create({
        key: this.name + 'Move',
        frames: parentThis.anims
          .generateFrameNumbers(this.name, {start: 1, end: 2}),
        frameRate: this.animSpeed,
        repeat: -1,
        loop: true
      });
  
      parentThis.anims.create({
        key: this.name + 'Idle',
        frames: [{key: this.name, frame: 0}],
        frameRate: 10
      });
  
      parentThis.anims.create({
        key: this.name + 'Die',
        frames: [{key: this.name, frame: 5}],
        frameRate: 10
      });
  
      parentThis.anims.create({
        key: this.name + 'Jump',
        frames: [{key: this.name, frame: 1}],
        frameRate: 10
      });
  
      parentThis.anims.create({
        key: this.name + 'Punch',
        frames: [{key: this.name, frame: 4}],
        frameRate: 10
      });
    }

  }
}


class enemyActor extends Actor {
  // Creates a acidBug.
  constructor(scene, x, y, texture, speed, animSpeed=speed) {
    let superArgs = [
      scene, x, y,
      texture,
      speed,
      texture,  // Name is the same as texture.
      animSpeed
    ];
    super(...superArgs);

    // All enemies don't collide with world bounds:
    this.setCollideWorldBounds(false);

    this.getHitByPunch = (target1, punchObject) => {
      // When a zombie gets hit, e.g. by a punch.
      target1.stun(400);
      target1.setVelocityY(-150);
      let velocity = 250 + Math.abs(player.body.velocity.x)*1.5;
      target1.body.velocity.x = (player.flipX) ? -velocity : velocity;
      punchObject.destroy();
      parentThis.physics.world.removeCollider(this.collider);
      parentThis.physics.world.removeCollider(this.punchCollider);
      target1.die();
      player.addScore(100 + parseInt(Math.abs(player.body.velocity.x)/2));
      player.addKill();
    }

    // Adding punch collision:
    this.punchboxArgs = [
      this, punchboxes, this.getHitByPunch, null, parentThis
    ];
    this.punchCollider = parentThis.physics.add.overlap(...this.punchboxArgs);
    
    // Player collision stuff:
    this.collisionArgs = [player, this, player.getHit, null, this]
    this.collider = parentThis.physics.add.overlap(...this.collisionArgs);
    
    // Edge detection and enemiesAlive array stuff:
    this.edgeDetectorArgs = [
      this, edgeNodes, this.changeDir, null, parentThis
    ];
    let edArgs = this.edgeDetectorArgs;
    this.edgeDetector = parentThis.physics.add.overlap(...edArgs);
    enemiesAlive.push(this);

    // Vision ray casting:
    this.castVisionRay = () => {
      if (this.alive) {
        // This controls the actor's LoS raycast.
        let flipTernary = (this.flipX) ? 0 : config.width;
        this.lineOfSight.setTo(this.x, this.y, flipTernary, this.y);
        let tilesWithinShape = map.getTilesWithinShape(this.lineOfSight);
        let i = (this.flipX) ? tilesWithinShape.length - 1 : 0;
        while ((this.flipX) ? i > -1 : i < tilesWithinShape.length) {
          // If the actor is facing left, then the tiles within the line 
          // should be iterated right-to-left instead of left-to-right.
          let tile = tilesWithinShape[i];
          if (tile.collides) {
            flipTernary = (!this.flipX) ? tile.pixelX - 16 : tile.pixelX;
            this.lineOfSight.setTo(this.x, this.y, flipTernary, this.y);
            break;
          }
          (this.flipX) ? i-- : i++;
        }
      }
      else {
        delete this.lineOfSight;
      }
    };
  }
}


class AcidBug extends enemyActor {
  // Creates an acidBug.
  constructor(scene, x, y) {
    // Movement speed randomizer:
    let speed = 80 * (1 + (Math.random() - 0.5) / 7)
    let superArgs = [
      scene, x, y,
      'acidbug',
      speed,
      speed*2, // Animations should be fairly fast.
    ];
    super(...superArgs);
    this.body.setSize(16, 11);
    this.body.setOffset(0, 5);
    this.standingAtTarget = false;
    this.nodeTouched = false;
    this.chasing = false;
    this.seesTarget = false;
    this.wandering = true;
    let losArgs = [this.x, this.y, (this.flipX) ? 0 : config.width, this.y];
    this.lineOfSight = new Phaser.Geom.Line(...losArgs);

    // -- AcidBug AI stuff -- //

    this.canSpit = true;
    this.spitAcid = () => {
      if (this.canSpit && this.alive) {
        soundManager.play('spit');
        let xPos = (this.flipX) ? this.x - 2 : this.x + 2;
        let acidBall = parentThis.physics.add.image(xPos, this.y+2, 'acid');
        acidBall.setSize(4, 4);
        acidBall.targetArgs = [
          player, acidBall, player.getHitByProjectile, null, parentThis
        ];
        parentThis.physics.add.overlap(...acidBall.targetArgs);
        let collideArgs = [acidBall, platforms, () => acidBall.destroy()];
        parentThis.physics.add.collider(...collideArgs);
        acidBall.setVelocityX(((this.flipX) ? -speed : speed) * 3);
        acidBall.setVelocityY(-50);
        this.canSpit = false;
        parentThis.time.delayedCall(2000, () => this.canSpit = true);
      }
      parentThis.time.delayedCall(200, () => this.stunned = false);
    }
    
    this.spitAttack = () => {
      this.goIdle();
      this.stunned = true;
      parentThis.time.delayedCall(500, () => this.spitAcid());
    }

    this.lastx = this.x;
    this.updateLastX = () => {
      this.lastx = this.x;
    }
    let posTimerArgs = {delay: 200, callback: this.updateLastX, repeat: -1};
    this.positionTimer = parentThis.time.addEvent(posTimerArgs);

    let wanderDirection = false;  // false == right, true == left
    this.newWanderDir = () => {
      wanderDirection = Boolean(Phaser.Math.Between(0, 1));
    }
    this.wanderTimerArgs = {
      delay: 1000, callback: this.newWanderDir, repeat: -1
    };
    this.wanderTimer = parentThis.time.addEvent(this.wanderTimerArgs);

    this.wander = () => {
      // When the bug isn't pursuing the player.
      this.wandering = true;
      let movementSpeed = (wanderDirection) ? -this.speed : this.speed;
      //let validMovementRange = this.x > this.width;
      if (this.wanderTimer.elapsed < 700) {  // Keeps the enemy on screen.
        if (this.x <= this.width/2 - 2) {
          wanderDirection = false;
        }
        else if (this.x >= config.width - this.width/2 + 2) {
          wanderDirection = true;
        }
        this.go(movementSpeed);
      }
      else {
        this.goIdle();
      }
    }
    
    this.go = (speed) => {
      this.moveX(speed, this.drag);
      this.anims.play('acidbugMove', true);
      this.flipX = (speed < 0) ? true : false;
    }
    
    this.move = (target) => {  // Acid bug movement AI.
      this.castVisionRay();
      if (this.alive && !this.stunned) {
        if (noAI === false) {  // Ignored if noAI is true.
          // Stuff for when the acidBugs sees the player:
          this.seesPlayerRight = (
            (this.x < target.x && !this.flipX) &&
            this.lineOfSight.x2 >= target.x &&
            Math.abs(this.y - target.y) <= 32 &&
            target.alive
          );
          this.seesPlayerLeft = (
            (this.x > target.x && this.flipX) &&
            this.lineOfSight.x2 <= target.x &&
            Math.abs(this.y - target.y) <= 32 &&
            target.alive
          );
          if (this.seesPlayerLeft || this.seesPlayerRight) {
            this.lineOfSight.setTo(this.x, this.y, target.x, target.y);
            // After making the raycast lock on the player, check if there's
            // any blocks obstructing the path:
            let LoScheck = map.getTilesWithinShape(this.lineOfSight);
            if (LoScheck.filter(x => x.collides).length > 0) {
              this.seesPlayerLeft = false;
              this.seesPlayerRight = false;
              this.castVisionRay();
              parentThis.graphics.lineStyle(1, 0xFF0000, 1);
            }
            else {
              parentThis.graphics.lineStyle(2, 0x00FF00, 1);
            }
          }
          // Movement conditionals, ignored if noTarget is enabled:
          let pastLeftBorder = this.x > this.width/2 - 2;
          let pastRightBorder = this.x < config.width - this.width/2 + 2;
          let onScreen = pastLeftBorder && pastRightBorder;
          // onScreen prevents the bug from spitting while offscreen.
          if (this.seesPlayerLeft && !noTarget) {
            if (Math.abs(this.x - target.x) <= 64 && onScreen) {
              this.spitAttack();
            }
            else {
              this.go(-this.speed);
            }
            this.lineOfSight.setTo(this.x, this.y, target.x, target.y);
          }
          else if (this.seesPlayerRight && !noTarget) {
            if (Math.abs(this.x - target.x) <= 64 && onScreen) {
              this.spitAttack();
            }
            else {
              this.go(this.speed);
            }
            this.lineOfSight.setTo(this.x, this.y, target.x, target.y);
          }
          else {
            this.wander();
            parentThis.graphics.lineStyle(1, 0xFF0000, 1);
          }
          let touchingWall = this.body.blocked.left || this.body.blocked.right;
          if (touchingWall && this.x === this.lastx) {
            // If touching a wall and not moved since last position...
            this.setVelocityY(-125);
          }
        }
        else {
          this.goIdle();
        }
      }
      else {
        if (this.body.collideWorldBounds) {
          this.setCollideWorldBounds(false);
        }
        //if (!this.destroyed) {
          this.decayVelocityX(0.55);
        //}
      }
    }

    // -- End Acid bug AI -- //
    
    this.changeDir = (buggeh, node) => {
      if (this.wandering && this.body.blocked.down) {
        if (this.x <= node.x) {
          wanderDirection = true;
        }
        else if (this.x > node.x) {
          wanderDirection = false;
        }
      }
    }
  }
}

function CreateRandomAcidBug() {
  let randomSpawn = parseInt(Math.random() * enemySpawnpoints.length);
  let x = enemySpawnpoints[randomSpawn][0];
  let y = enemySpawnpoints[randomSpawn][1];
  new AcidBug(parentThis, x, y);
}


class Bat extends enemyActor {
  // Creates a bat.
  constructor(scene, x, y) {
    // Movement speed randomizer:
    let speed = 40 * (1 + (Math.random() - 0.5) / 7);
    let superArgs = [
      scene, x, y,
      'bat',
      speed,
      speed*3,  // Bat wings flap pretty quickly!
    ];
    super(...superArgs);

    this.body.setGravity(0, -500);
    this.body.setSize(8, 8);
    let losArgs = [this.x, this.y, (this.flipX) ? 0 : config.width, this.y];
    this.lineOfSight = new Phaser.Geom.Line(...losArgs);
    this.magnitude = speed;
    this.changeFlightDirection = true;
    this.flightDirection = 0;  // In radians.
    this.dodgeDirection = 0;  // Ditto.

    this.goIdle = (arg) => {
      this.body.velocity.y = 0;
      this.body.velocity.x = 0;
      this.anims.play('batMove', true);
    };

    this.decayVelocityY = (arg=0.5) => {  // Actor velocity decay from drag.
      if (this.destroyed) return;
      let decayRatio = arg;
      if (!this.body.blocked.down) {
        decayRatio *= 1.75;
      }
      this.body.velocity.y = parseInt(this.body.velocity.y * decayRatio);
    }

    this.wander = () => {
      if (this.changeFlightDirection) {
        this.flightDirection = Phaser.Math.FloatBetween(0, Math.PI*2);
        // Direction is 0 to 2*pi radians or 0 to 360 degrees.
        this.changeFlightDirection = false;
        let cb = () => this.changeFlightDirection = true;
        parentThis.time.delayedCall(500, cb);
      }
      if (this.x <= this.width/2 - 2) {
        // If the bat is offscreen to the left...
        this.flightDirection = 0;  // Zero radians = moving right.
      }
      else if (this.x >= config.width - this.width/2 + 2) {
        // or offscreen to the right...
        this.flightDirection = Math.PI;  // Pi radians = moving left.
      }
      this.moveInDirection(this.flightDirection);      
    };

    this.dodge = (target) => {
      // Makes the bat dodge.
      let targetVel = target.body.velocity.x;
      if (targetVel == 0) {
        if (target.x >= this.x) {
          this.dodgeDirection = Math.PI;
        }
        else {
          this.dodgeDirection = 0;
        }
      }
      else if (targetVel > 0) {
        this.dodgeDirection = Math.PI;
      }
      else {
        this.dodgeDirection = 0;
      }
      this.moveInDirection(this.dodgeDirection, 3);      
    };

    this.moveInDirection = (dir, coeff=1) => {
      // Makes the bat move in the given direction in radians.
      // coeff is for increasing the magnitude of the movement.
      let speedX = this.magnitude * Math.cos(dir);  // X component
      let speedY = -this.magnitude * Math.sin(dir);  // Y component
      this.flipX = speedX < 0;
      this.moveX(coeff * speedX, this.drag);
      this.moveY(coeff * speedY, this.drag);
      //console.log(speedX + ', ' + speedY);
    };

    this.move = (target) => {
      this.castVisionRay();
      if (this.alive) {
        if (noAI === false) {  // Ignored if noAI is true.
          this.seesPlayerRight = (
            (this.x < target.x && !this.flipX) &&
            this.lineOfSight.x2 >= target.x &&
            Math.abs(this.y - target.y) <= 64 &&
            target.alive
          );
          this.seesPlayerLeft = (
            (this.x > target.x && this.flipX) &&
            this.lineOfSight.x2 <= target.x &&
            Math.abs(this.y - target.y) <= 64 &&
            target.alive
          );
          if (this.seesPlayerLeft || this.seesPlayerRight) {
            this.lineOfSight.setTo(this.x, this.y, target.x, target.y);
            // After making the raycast lock on the player, check if there's
            // any blocks obstructing the path:
            let LoScheck = map.getTilesWithinShape(this.lineOfSight);
            if (LoScheck.filter(x => x.collides).length > 0) {
              this.seesPlayerLeft = false;
              this.seesPlayerRight = false;
              this.castVisionRay();
              parentThis.graphics.lineStyle(1, 0xFF0000, 1);
            }
            else {
              parentThis.graphics.lineStyle(2, 0x00FF00, 1);
            }
          }
          
          this.seesPlayer = this.seesPlayerLeft || this.seesPlayerRight;

          let inHeadStompDanger = (
            target.y > this.y - 64 &&
            target.y < this.y &&
            !target.body.blocked.down &&
            Math.abs(target.x - this.x) < 24 &&
            target.body.velocity.y > 0
          );

          if (inHeadStompDanger) {  // Dodge if about to get stomped.
            // *chuckles*
            // i'm in danger!
            this.dodge(target);
          }
          else if (this.seesPlayer) {
            // This basically uses a vector to get 
            // the correct X and Y movement speeds.
            let diffY = (-1 * (target.y - this.y));
            let diffX = target.x - this.x;
            let direction = Math.atan2(diffY, diffX);
            let dirDeg = direction;
            this.moveInDirection(direction, 1.5);
          }
          else {
            this.wander();
          }

        }
        else {
          this.goIdle();
        }
        this.anims.play('batMove', true);
      }
      else {
        if (this.body.collideWorldBounds) {
          this.setCollideWorldBounds(false);
        }
        if (this.body.height != 16) {
          this.body.setSize(8, 16);
        }
        if (this.body.gravity.y === -500) {
          this.body.setGravity(0, 500);
        }
        this.decayVelocityX(0.55);
      }
    };

  }
}

function CreateRandomBat() {
  let randomSpawn = parseInt(Math.random() * enemySpawnpoints.length);
  let x = enemySpawnpoints[randomSpawn][0];
  let y = enemySpawnpoints[randomSpawn][1];
  new Bat(parentThis, x, y);
}


class Player extends Actor {
  // Creates a this.
  constructor(scene, x, y, texture, speed, name=texture) {
    super(scene, x, y, texture, speed, name);
    this.score = 0;
    this.kills = 0;
    this.holdingJump = false;
    this.holdingPunch = false;
    this.isPunching = false;
    this.punchAnimPlay = false;
    this.punchCoolingDown = false;
    this.hb = [];  // Array for pointers to the health bar images.
    // Player health bar:
    for (let i = 0; i < this.health; i++) {
      let pos = config.width - 8 - (i * 12);
      this.hb.unshift(parentThis.add.image(pos, 8, 'heart'));
    }

    // Player methods:

    this.getScore = () => this.score.toString().padStart(7, '0');

    this.setScore = (points) => {
      this.score = points;
      updateText('playerScore', this.getScore);
    };

    this.addScore = (points) => {
      this.score += points;
      updateText('playerScore', this.getScore);
    };

    this.getKills = () => this.kills.toString().padStart(3, '0');

    this.addKill = () => {
      this.kills++;
      gameEnemyManager.decrement();
    };
  
    this.addHealth = () => {
      if (this.health < 3) {
        this.health++;
        this.hb[3 - this.health].setVisible(true);
      }
      else {
        this.addScore(1000);
      }
    };

    this.decrementHealth = () => {
      this.health--;
      if (this.hb.length) {
        this.hb[2 - this.health].setVisible(false);
      }
    };

    this.setHealth = (hp) => {
      if (hp > 3 || hp < 0) {
        hp = (hp > 3) ? 3 : 0;
      }
      while (hp < this.health) {
        this.decrementHealth();
      }
      while (hp > this.health) {
        this.addHealth();
      }
    };
  
    this.punch = () => {
      this.playSoundPunch();
      this.anims.play('playerPunch');
      this.isPunching = true;
      this.punchAnimPlay = true;
      this.punchCoolingDown = true;
      parentThis.time.delayedCall(150, () => this.punchAnimPlay = false);
      parentThis.time.delayedCall(200, () => this.punchCoolingDown = false);
      let CollisionX = (this.flipX) ? this.x - 10 : this.x + 10;
      let punchbox = punchboxes.create(CollisionX, this.y, 'punchbox');
      parentThis.time.delayedCall(150, () => punchbox.destroy());
    };

    this.update = () => {
      // Player input and animations conditionals:
      const onGround = this.body.blocked.down;

      if (this.health == 0) {
        this.die();
      }

      if (this.alive) {
        if (!(cursors.left.isDown && cursors.right.isDown)) {
          if (cursors.left.isDown) {
            this.moveX(-this.speed, this.drag);
            this.flipX = true;
            this.anims.play('playerMove', true);
          }
          else if (cursors.right.isDown) {
            this.moveX(this.speed, this.drag);
            this.flipX = false;
            this.anims.play('playerMove', true);
          }
          else {
            this.goIdle();
          }
        }
        else {
          this.goIdle();
        }

        if (!onGround) {
          this.anims.play('playerJump');
        }

        if (cursors.a.isDown) {
          if (!this.isPunching && !this.stunned) {
            this.punch();
          }
        }
        else if (cursors.a.isUp && !this.punchCoolingDown) {
          this.isPunching = false;
        }
        if (this.punchAnimPlay) {
          this.anims.play('playerPunch');
        }

        if (cursors.b.isDown && onGround && !this.holdingJump) {
          this.setVelocityY(-300);
          soundManager.play('jump');
          this.holdingJump = true;
        }
        else if (cursors.b.isUp) {
          this.holdingJump = false;
        }

        if (this.invul) {
          this.flicker();
        } else {
          this.visible = true;
        }
      }
      else {
        this.decayVelocityX(0.55);
      }
    };

  }
}


class Zombie extends enemyActor {
  // Creates a zombie.
  constructor(scene, x, y) {
    let superArgs = [
      scene, x, y,
      'zombie',
      40 * (1 + (Math.random() - 0.5) / 7),  // Movement speed randomizer.
    ];
    super(...superArgs);
    this.standingAtTarget = false;
    this.nodeTouched = false;
    this.chasing = false;
    this.seesTarget = false;
    this.wandering = true;
    let losArgs = [this.x, this.y, (this.flipX) ? 0 : config.width, this.y];
    this.lineOfSight = new Phaser.Geom.Line(...losArgs);

    // -- Zombie AI stuff -- //

    this.lastx = this.x;
    this.updateLastX = () => {
      this.lastx = this.x;
    }
    let posTimerArgs = {delay: 200, callback: this.updateLastX, repeat: -1};
    this.positionTimer = parentThis.time.addEvent(posTimerArgs);

    let wanderDirection = false;  // false == right, true == left
    this.newWanderDir = () => {
      wanderDirection = Boolean(Phaser.Math.Between(0, 1));
    }
    this.wanderTimerArgs = {
      delay: 2000, callback: this.newWanderDir, repeat: -1
    };
    this.wanderTimer = parentThis.time.addEvent(this.wanderTimerArgs);

    this.wander = () => {
      // When the zombie isn't pursuing the player.
      this.wandering = true;
      let movementSpeed = (wanderDirection) ? -this.speed : this.speed;
      //let validMovementRange = this.x > this.width;
      if (this.wanderTimer.elapsed < 1700) {
        if (this.x <= this.width/2 - 2) {
          wanderDirection = false;
        }
        else if (this.x >= config.width - this.width/2 + 2) {
          wanderDirection = true;
        }
        this.go(movementSpeed);
      }
      else {
        this.goIdle();
      }
    }
    
    this.go = (speed) => {
      this.moveX(speed, this.drag);
      this.anims.play('zombieMove', true);
      this.flipX = (speed < 0) ? true : false;
    }
    
    this.move = (target) => {  // Zombie movement AI.
      this.castVisionRay();
      if (this.alive && !this.stunned) {
        if (noAI === false) {  // Ignored if noAI is true.
          // Stuff for when the zombies sees the player:
          this.seesPlayerRight = (
            (this.x < target.x && !this.flipX) &&
            this.lineOfSight.x2 >= target.x &&
            Math.abs(this.y - target.y) <= 32 &&
            target.alive
          );
          this.seesPlayerLeft = (
            (this.x > target.x && this.flipX) &&
            this.lineOfSight.x2 <= target.x &&
            Math.abs(this.y - target.y) <= 32 &&
            target.alive
          );
          if (this.seesPlayerLeft || this.seesPlayerRight) {
            this.lineOfSight.setTo(this.x, this.y, target.x, target.y);
            // After making the raycast lock on the player, check if there's
            // any blocks obstructing the path:
            let LoScheck = map.getTilesWithinShape(this.lineOfSight);
            if (LoScheck.filter(x => x.collides).length > 0) {
              this.seesPlayerLeft = false;
              this.seesPlayerRight = false;
              this.castVisionRay();
              parentThis.graphics.lineStyle(1, 0xFF0000, 1);
            }
            else {
              parentThis.graphics.lineStyle(2, 0x00FF00, 1);
            }
          }
          // Movement conditionals, ignored if noTarget is enabled:
          if (this.seesPlayerLeft && !noTarget) {
            this.go(-this.speed);
            this.lineOfSight.setTo(this.x, this.y, target.x, target.y);
          }
          else if (this.seesPlayerRight && !noTarget) {
            this.go(this.speed);
            this.lineOfSight.setTo(this.x, this.y, target.x, target.y);
          }
          else {
            this.wander();
            parentThis.graphics.lineStyle(1, 0xFF0000, 1);
          }
          let touchingWall = this.body.blocked.left || this.body.blocked.right;
          if (touchingWall && this.x === this.lastx) {
            // If touching a wall and not moved since last position...
            this.setVelocityY(-125);
          }
        }
        else {
          this.goIdle();
        }
      }
      else {
        if (this.body.collideWorldBounds) {
          this.setCollideWorldBounds(false);
        }
        //if (!this.destroyed) {
          this.decayVelocityX(0.55);
        //}
      }
    }

    // -- End zombie AI -- //
    
    this.changeDir = (zombeh, node) => {
      if (this.wandering && this.body.blocked.down) {
        if (this.x <= node.x) {
          wanderDirection = true;
        }
        else if (this.x > node.x) {
          wanderDirection = false;
        }
      }
    }
  }
}

function CreateRandomZombie() {
  let randomSpawn = parseInt(Math.random() * enemySpawnpoints.length);
  let x = enemySpawnpoints[randomSpawn][0];
  let y = enemySpawnpoints[randomSpawn][1];
  new Zombie(parentThis, x, y);
}


// Array for storing the pickupables:
let pickupables = [];
// Used when generating overlap colliders.

function mixinPickupableMethods(p, sprite, destructTime) {
  // Mixin for generic pickupable methods.

  p.pickup = (player, child) => {
    player.addScore(250);
    soundManager.play('pickup');
    p.remove(child, true, true);
  }

  p.spawn = (posX, posY) => {
    p.create(posX, posY, sprite);
    let lastInst = p.children.entries[p.children.entries.length-1];
    lastInst.setDepth(1);
    let destroy = () => {
      p.remove(lastInst, true, true);
    }
    parentThis.time.delayedCall(destructTime, destroy);
  }
  
  p.spawnRandom = () => {
    // Selects a random position from the valid spawn areas:
    let position = pickRandomSprite(validItemSpawnAreas);
    let distArgs = [position[0], position[1], player.x, player.y];
    // Prevents items from spawning on the player:
    while (calculateDistance(...distArgs) < 32) {
      position = pickRandomSprite(validItemSpawnAreas);
      distArgs = [position[0], position[1], player.x, player.y];
    }
    p.spawn(...position);
  }

  pickupables.push(p);

}


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
    loadingScene, titleScene, levelIntroScene, keyBindingScene,
    mainScene, scoresScene, pausedScene, optionsMenuScene,
    creditsScene, gameOverScene, nameEnteringScene, scoreSubmittedScene
  ]
};

// -- Global variables: -- //

let quitGame = () => nw.App.quit();
let centerX = config.width/2;
let centerY = config.height/2;
let coins;
let food;
let cursors;
let cursorsPaused;
let paused = false;
let parentThis;
let randBool = true;
let enteredName = '';

let codeKeys = {};
for (let key in Phaser.Input.Keyboard.KeyCodes) {
  codeKeys[Phaser.Input.Keyboard.KeyCodes[key]] = key;
}

// Sound manager:
let soundManager = new soundManagerClass();

let textObjects = {};  // Object for storing the displayed texts.
// Note that textObjects just serves as pointers to the letter image objects.
// Removing an key from it or reassigning letters in key's value 
// has no effect on the image objects. 
// To delete a single letter, use destroy().

let menuButtons = {};  // Object for storing menu buttons.

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
let showVisionRays = true;
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
  destroyAllText();
  destroyMenuButtons();

  totalEnemiesSpawned = 0;
  enemySpawnpoints = [];
  enemiesAlive = [];
  enemiesFilter = false;
  pickupables = [];
  currentLevel = undefined;
  levelNumber = 0;
  lastLevelHealth = 3;
  gameOverTriggered = false;

  spawnEnemies = true;
  canPause = true;
}
