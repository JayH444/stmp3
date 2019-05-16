//- src\scenes\levelIntroScene.js -////////////////////////////////////////////

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
}

function levelIntroCreate() {
  parentThis = this;
  printTextCenter('Level 1', 'levelIntroText');
  setTimeout(() => {
    parentThis.scene.launch('mainScene');
    parentThis.scene.stop('levelIntroScene');    
  }, 1500);
}

function levelIntroUpdate() {
  parentThis = this;
}

///////////////////////////////////////////////////////////////////////////////


//- src\scenes\loadingScene.js -///////////////////////////////////////////////

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
  let fs = require('fs');
  let files = fs.readdirSync('../dev/root/dist/assets');
  for (let file of files) {
    // Loop for loading the images in the assets directory.
    // Automatically names them.
    // !!!Ignores files with a 'spritesheet_' prefix!!!
    // Spritesheets need to be loaded manually.
    let pattern = /(\w+)\.png/;
    this.load.image(file.match(pattern)[1], 'assets/' + file);
  }
  // Player spritesheet:
  this.load.spritesheet('player', 'assets/spritesheet_dude.png', 
    {frameWidth: 16, frameHeight: 16}
  );
  // Zombie spritesheet:
  this.load.spritesheet('zombie', 'assets/spritesheet_zombie.png',
    {frameWidth: 16, frameHeight: 16}
  );

  // Font spritesheet. Uses ASCII values minus 32.
  this.load.spritesheet('fontmap', 'assets/spritesheet_font.png', 
    {frameWidth: 8, frameHeight: 8}
  );

  // Sound effect loader:
  files = fs.readdirSync('../dev/root/dist/sfx');
  for (let file of files) {
    // Loop for loading the sounds in the sfx directory.
    // Automatically names them.
    // Uses \w+ just in case there's any weird sound file extensions:
    let pattern = /(\w+)\.\w+/;
    this.load.audio(file.match(pattern)[1], 'sfx/' + file);
  }

  /*for (let i = 0; i < 500; i++) {
    this.load.image('gameLogo' + i, 'assets/game_logo.png');
  }*/

  this.load.image('menuCursor', 'assets/menu_cursor.png');
  this.load.image('gameLogo', 'assets/game_logo.png');
  this.load.image('tiles', 'assets/game_tiles.png');
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
      setTimeout(timeoutArg, 50*(i+1));
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
    setTimeout(launchTitle, 500);
    loadingComplete = false;
  };
}

///////////////////////////////////////////////////////////////////////////////


//- src\scenes\mainScene.js -//////////////////////////////////////////////////

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

  this.load.tilemapTiledJSON(
    'theMap',
    'levelTest/test.json'
  );

}

function create() {

  parentThis = this;
  this.bg = this.add.tileSprite(0, 0, 800, 600, 'sky');

  // Level creation stuff:

  window.punchboxes = this.physics.add.staticGroup();
  window.edgeNodes = this.physics.add.staticGroup();
  window.grass = this.physics.add.staticGroup();

  window.map = this.make.tilemap({key: 'theMap'});
  window.tiles = map.addTilesetImage('gameTiles', 'tiles');
  window.platforms = map.createDynamicLayer('background', tiles, -16, 0);
  platforms.setCollisionByProperty({collides: true});

//// Entity creation code needs to be rewritten to work in tiled: /////////////

  for (let i = 0; i < level.length; i++) {
    let row = level[i];
    for (let j = 0; j < row.length; j++) {
      let x = 16*j - 8;
      let y = 16*i + 8;
      if (functionForKey.hasOwnProperty(row[j])) {
        functionForKey[row[j]](x, y);
      }
      else if (row[j] != 'n') {
        //let msg = `Unknown map element "${row[j]}" at row ${i+1}, col ${j+1}.`
        //console.log(msg);
      }
    }
  }

////

  for (let area of ValidItemSpawnAreas) {
    let ranSprite = pickRandomSprite(['grass1', 'grass2']);
    grass.create(area[0], area[1], ranSprite);
  }

  // ^ Level Creation stuff ^

  let playerArgs = [parentThis, centerX, config.height-32, 'player', 160];
  window.player = new Player(...playerArgs);

  // Collision detection for player and zombies:
  window.player.colliders = {};
  for (let zed of zombies) {
    zed.collisionArgs = [player, zed, player.getHit, null, this]
    zed.collider = this.physics.add.overlap(...zed.collisionArgs);
    player.colliders[zed.id] = zed.collider;
  }

  // Game enemy manager:
  window.gameEnemyManager = new EnemyManagerClass();
  // Game timer:
  window.theTimer = new gameTimer(gameEnemyManager);

  // Game topbar text:
  let scoreX = 8;
  printText('SCORE:', scoreX, 8, 'scoreText');
  printText(player.getScore(), scoreX + 48, 8, 'playerScore');
  let foesX = 130;
  printText('FOES:', foesX, 8, 'foesText');
  printText(gameEnemyManager.getEnemyCountText(), foesX + 40, 8, 'foesLeft');
  let timeX = 212;
  printText('TIME:', timeX, 8, 'timeText');
  printText(theTimer.getTimeRemaining(), timeX + 40, 8, 'timeRemaining');
  theTimer.startTimer();

  // This creates the keybinds:
  cursors = this.input.keyboard.addKeys({
    up: Phaser.Input.Keyboard.KeyCodes.W,
    down: Phaser.Input.Keyboard.KeyCodes.S,
    left: Phaser.Input.Keyboard.KeyCodes.A,
    right: Phaser.Input.Keyboard.KeyCodes.D,
    b: Phaser.Input.Keyboard.KeyCodes.SPACE,
    a: Phaser.Input.Keyboard.KeyCodes.CTRL,
    p: Phaser.Input.Keyboard.KeyCodes.P
  });
  
  let timerArgs = {delay: 3000, callback: CreateRandomZombie, repeat: -1};
  if (spawnEnemies) {
    zombieTimer = this.time.addEvent(timerArgs);
  }

  // Pickupables:

  coins = this.physics.add.group();
  coins.setDepth(0, 0);

  mixinPickupableMethods(coins, 'coin', 5000)

  let csArgs = {delay: 15000, callback: coins.spawnRandom, repeat: -1};
  let coinSpawner = this.time.addEvent(csArgs);


// Food spawning:
  food = this.physics.add.group();
  food.setDepth(0, 0);

  mixinPickupableMethods(food, 'burger', 10000)

  food.pickup = (player, foodItem) => {
    player.addHealth();
    parentThis.sound.play('gethealth');
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

  let fsArgs = {
    delay: 3000,
    callback: pickupableTimer,
    callbackScope: this
  };

  let foodSpawner = this.time.addEvent(fsArgs);

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
  
  for (let p of pickupables) {
    parentThis.physics.add.collider(p, platforms);
    this.physics.add.overlap(player, p, p.pickup, null, parentThis);
  }

  let defaultLineStyle = {lineStyle: {width: 1, color: 0xFF0000}};
  parentThis.graphics = parentThis.add.graphics(defaultLineStyle);
}


function update() {
  parentThis = this;
  if (Phaser.Input.Keyboard.JustDown(cursors.p) && !paused) {
    console.log('pausing...');
    paused = true;
    this.scene.launch('pausedScene');
    this.scene.pause('mainScene');
  } 
  else {
      this.scene.resume('mainScene');
  }

  player.update();

  parentThis.graphics.clear();

  zombies.forEach((zombie) => {
    if (zombie.destroyed && !zombiesFilter) {
      zombiesFilter = true;
      let ZedIdIndex = zombieUsedIDs.indexOf(zombie.id);
      // Removes dead zombie ID from used IDs:
      zombieUsedIDs.splice(ZedIdIndex, 1);
    } else {
      zombie.move(player);
    }
    if (zombie.alive && showVisionRays) {
      parentThis.graphics.strokeLineShape(zombie.lineOfSight);
    }
  });


  if (zombiesFilter) {
    // Cleanup for dead zombies in the zombies array.
    zombies = zombies.filter(x => x.destroyed == false);
    zombiesFilter = false;
  }

}

///////////////////////////////////////////////////////////////////////////////


//- src\scenes\pausedScene.js -////////////////////////////////////////////////

// Scene for when the game is paused.

class pausedScene extends Phaser.Scene {
  constructor() {
    super({key:'pausedScene'});
    this.preload = function() {
    };
    this.create = function() {
      printText('PAUSED', centerX-20, centerY, 'pauseText');
      // This creates the keybinds:
      cursorsPaused = this.input.keyboard.addKeys({
        p: Phaser.Input.Keyboard.KeyCodes.P
      });
    }
    this.update = function() {
      if (Phaser.Input.Keyboard.JustDown(cursorsPaused.p) && paused) {
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
    }
  }
}

///////////////////////////////////////////////////////////////////////////////


//- src\scenes\titleScene.js -/////////////////////////////////////////////////

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
  
  window.validMenuPositions = [];

  function addMenuOption(str, id, x, y) {
    validMenuPositions.push([y, id]);
    printText(str, x, y, id);
  }

  function addMenuOptionCenterX(str, id, y) {
    validMenuPositions.push([y, id]);
    printTextCenter(str, id, y);
  }

  let playText = 'Play';
  let quitText = 'Quit';
  addMenuOptionCenterX(playText, 'playText', centerY - 4);
  addMenuOptionCenterX(quitText, 'quitText', centerY + 12);

  let menuCursorArgs = [
    textObjects['playText'][0].x-10, textObjects['playText'][0].y, 'menuCursor'
  ];
  window.menuCursor = this.add.image(...menuCursorArgs);
  menuCursor.position = 0;

  window.menuFunctions = {
    playText: () => {
      parentThis.scene.launch('levelIntroScene');
      parentThis.scene.stop('titleScene');
    },
    quitText: () => {
      nw.App.quit();
    },
  };

  // This creates the keybinds:
  cursors = this.input.keyboard.addKeys({
    up: Phaser.Input.Keyboard.KeyCodes.W,
    down: Phaser.Input.Keyboard.KeyCodes.S,
    left: Phaser.Input.Keyboard.KeyCodes.A,
    right: Phaser.Input.Keyboard.KeyCodes.D,
    b: Phaser.Input.Keyboard.KeyCodes.SPACE,
    a: Phaser.Input.Keyboard.KeyCodes.CTRL,
    p: Phaser.Input.Keyboard.KeyCodes.P,
    start: Phaser.Input.Keyboard.KeyCodes.ENTER,
  });
}

function titleUpdate() {
  parentThis = this;
  if (Phaser.Input.Keyboard.JustDown(cursors.down)) {
    if (menuCursor.position + 1 < validMenuPositions.length) {
      menuCursor.position++;
      menuCursor.y = validMenuPositions[menuCursor.position][0];
    }
  }
  else if (Phaser.Input.Keyboard.JustDown(cursors.up)) {
    if (menuCursor.position - 1 > -1) {
      menuCursor.position--
      menuCursor.y = validMenuPositions[menuCursor.position][0];
    }
  }
  if (Phaser.Input.Keyboard.JustDown(cursors.start) || Phaser.Input.Keyboard.JustDown(cursors.a)) {
    let currKey = validMenuPositions[menuCursor.position][1];
    if (menuFunctions.hasOwnProperty(currKey)) {
      menuFunctions[currKey]();
    }
  }
}

///////////////////////////////////////////////////////////////////////////////


//- src\functions\mathFunctions.js -///////////////////////////////////////////

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

///////////////////////////////////////////////////////////////////////////////


//- src\functions\textFunctions.js -///////////////////////////////////////////

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
  printText(str, centerX - (str.length*8/2)+4, y, id);
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
  /*console.log(textId);
  console.log(textObjects[textId]);*/
  for (let i of textObjects[textId]) {
    i.destroy();
  }
  textObjects[textId] = undefined;
  delete textObjects[textId];
}

///////////////////////////////////////////////////////////////////////////////


//- src\components\enemyManager.js -///////////////////////////////////////////

class EnemyManagerClass {
  constructor() {
    this.enemyCount = Math.floor(Math.random()*12 + 12);
    this.decrement = this.decrement.bind(this);
    this.getEnemyCountText = this.getEnemyCountText.bind(this);
  }
  getEnemyCountText() {
    return this.enemyCount.toString().padStart(3, '0');
  }
  decrement() {
    if (this.enemyCount > 0) {
      this.enemyCount--;
      updateText('foesLeft', this.getEnemyCountText);
    }
  }
}

///////////////////////////////////////////////////////////////////////////////


//- src\components\gameTimer.js -//////////////////////////////////////////////

class gameTimer {
  // Class for the game timer and its properties and methods.
  // enemyManager is passed in as the argument to keep track of the number of
  // enemies alive, which is used for the timer's win/lose state.
  constructor(enemyManager) {
    this.timeRemaining = 90;
    this.getTimeRemaining = () => {
      return this.timeRemaining.toString().padStart(3, '0');
    };
    this.resetTime = () => {
      this.timeRemaining = 90;
    };
    this.tickTimer = () => {
      this.timeRemaining--;
      if (this.timeRemaining === -1) {
        /*if (enemyManager.enemyCount > 0) {
          player.die();
          for (let z of zombies) {
            z.die();
          }
          zombiesAlive = 0;
        }*/
        this.resetTime();
      }
      updateText('timeRemaining', this.getTimeRemaining);
    };
    this.startTimer = () => {
      let gameTimerEventArgs = {
        delay: 1000, callback: this.tickTimer, repeat: -1
      };
      parentThis.time.addEvent(gameTimerEventArgs);
    };
  }
}

///////////////////////////////////////////////////////////////////////////////


//- src\components\levelLoader.js -////////////////////////////////////////////

function loadLevelTilesheets() {
  // Loads the level tilesheets of the game in the "levels" folder.
  let fs = require('fs');
  let fileNames = fs.readdirSync('../dev/root/dist/levels');
  let res = [];
  for (let file of fileNames) {
    if (file == 'readme.txt') continue;
    let level = fs
      .readFileSync(`../dev/root/dist/levels/${file}`, 'utf-8')
      .split(/\r\n|\n/);  // Windows and Linux/Unix compatible!
    res.push(level);
  }
  return res;
}

let gameLevels = loadLevelTilesheets();

// Level loading code:
let level = gameLevels[Math.floor(Math.random()*gameLevels.length)];

let spriteForKey = {
  g: 'groundgrass', r: 'ground', s: 'scoreboard',
};

function createEdgeNode(x, y) {
  edgeNodes.create(x, y, 'edgenode');
}

function createZombieSpawn(x, y) {
  zombieSpawnpoints.push([x, y])
}

let functionForKey = {
  z: createZombieSpawn, e: createEdgeNode
};

function getValidItemSpawnAreas(level) {
  let res = [];
  for (let row = 2; row < level.length; row++) {
    for (let col = 1; col < level[row].length - 1; col++) {
      let conditions = (
        spriteForKey.hasOwnProperty(level[row][col]) &&
        level[row-1][col] == 'n'
      );
      if (conditions) {
        res.push([col * 16 - 8, (row-1) * 16 + 8]);
      }
    }
  }
  return res;
}

let ValidItemSpawnAreas = getValidItemSpawnAreas(level);

///////////////////////////////////////////////////////////////////////////////


//- src\components\menuCursor.js -/////////////////////////////////////////////



///////////////////////////////////////////////////////////////////////////////


//- src\actors\genericActor.js -///////////////////////////////////////////////

class Actor extends Phaser.Physics.Arcade.Sprite {
  // Constructor function "class" for creating an actor 
  // and its general methods and properties.
  constructor(scene, x, y, texture, speed, name=texture, collideWB=true) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(collideWB);
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
    // Animation speed scales with actor's movement speed:
    this.animSpeed = parseInt(0.09375 * this.speed);
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

    this.moveX = (speed, inertia) => {
      if (this.destroyed) return;
      if (!this.stunned) {
        if (Math.abs(this.body.velocity.x) < Math.abs(speed)) {
          this.body.velocity.x += (speed * inertia);
        }
        else {
          this.body.velocity.x = speed;
        }
      }
    }

    this.die = () => {
      this.visible = true;
      this.alive = false;
      this.health = 0;
      this.anims.play(this.name + 'Die');
      if (this.collision) this.collision.destroy();
      parentThis.time.delayedCall(1000, () => this.destroyed = true);
      //parentThis.time.delayedCall(5000, () => this.destroy());
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
      parentThis.sound.play('punch1');
    }
  
    this.getHit = (target1, target2) => {
      // Function that executes when collision 
      // between target1 and target2 occurs.
      if (target2.body.touching.up) {
        // target1 is above target2 (headstomp)
        this.playSoundPunch();
        parentThis.physics.world.removeCollider(target1.colliders[target2.id]);
        if (target1.hasOwnProperty('addScore')) {
          target1.addScore(100);
        }
        if (target1.hasOwnProperty('addKill')) {
          target1.addKill();
        }
        parentThis.physics.world.removeCollider(target2.punchCollider);
        target2.die();
        zombiesAlive--;
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
            target1.health--;
            if (target1.hb.length) {
              target1.hb[2 - target1.health].setVisible(false);
            }
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
            // Disables collision with target1:
            for (let c in target1.colliders) {
              parentThis.physics.world.removeCollider(target1.colliders[c]);
            }
            // Destroys the contents of colliders since target1 is dead:
            target1.colliders = {};
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

///////////////////////////////////////////////////////////////////////////////


//- src\actors\playerActor.js -////////////////////////////////////////////////

class Player extends Actor {
  // Creates a this.
  constructor(scene, x, y, texture, speed, name=texture) {
    super(scene, x, y, texture, speed, name, true);
    this.score = 0;
    this.getScore = () => this.score.toString().padStart(7, '0');
    this.addScore = (points) => {
      this.score += points;
      updateText('playerScore', this.getScore);
    };
    this.kills = 0;
    this.getKills = () => this.kills.toString().padStart(3, '0');
    this.addKill = () => {
      this.kills++;
      gameEnemyManager.decrement();
    }
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
  
    this.addHealth = () => {
      if (this.health < 3) {
        this.health++;
        this.hb[3 - this.health].setVisible(true);
      }
      else {
        this.addScore(1000);
      }
    }
  
    this.punch = () => {
      this.playSoundPunch();
      this.anims.play('playerPunch');
      this.isPunching = true;
      this.punchAnimPlay = true;
      this.punchCoolingDown = true;
      parentThis.time.delayedCall(100, () => this.punchAnimPlay = false);
      parentThis.time.delayedCall(200, () => this.punchCoolingDown = false);
      let CollisionX = (this.flipX) ? this.x - 10 : this.x + 10;
      let punchbox = punchboxes.create(CollisionX, this.y, 'punchbox');
      parentThis.time.delayedCall(100, () => punchbox.destroy());
    }

    this.update = () => {
      // Player input and animations conditionals:
      const onGround = this.body.blocked.down;

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
          if (!this.isPunching) {
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
          parentThis.sound.play('jump');
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
    }
  }
}

///////////////////////////////////////////////////////////////////////////////


//- src\actors\zombieActor.js -////////////////////////////////////////////////

class Zombie extends Actor {
  // Creates a zombie.
  constructor(scene, x, y) {
    let superArgs = [
      scene, x, y,
      'zombie',
      40 * (1 + (Math.random() - 0.5) / 7),  // Movement speed randomizer.
      'zombie',  // Name is the same as texture.
      false,  // Doesn't collide with world bounds.
    ];
    super(...superArgs);
    // Generates an ID for the zombies to be addressed by.
    // Technically will encounter problems if the count gets too high, 
    // but by that point you got bigger issues anyway...
    let IDNum = parseInt(Math.random() * 1000000);
    while (zombieUsedIDs.includes(IDNum)) {
      // Just in case the ID is already used...
      IDNum = parseInt(Math.random() * 1000000);
    }
    this.id = IDNum;
    zombieUsedIDs.push(IDNum);
    this.standingAtTarget = false;
    this.nodeTouched = false;
    this.chasing = false;
    this.seesTarget = false;
    this.wandering = true;
    this.lineOfSight = new Phaser.Geom.Line(this.x, this.y, (this.flipX) ? 0 : config.width, this.y);

    // Zombie AI stuff:
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
      let movementVector = (wanderDirection) ? -this.speed : this.speed;
      //let validMovementRange = this.x > this.width;
      if (this.wanderTimer.elapsed < 1700) {
        if (this.x <= this.width/2 - 2) {
          wanderDirection = false;
        }
        else if (this.x >= config.width - this.width/2 + 2) {
          wanderDirection = true;
        }
        this.go(movementVector);
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
      if (this.alive) {
        this.lineOfSight.setTo(this.x, this.y, (this.flipX) ? 0 : config.width, this.y);
        for (let tile of map.getTilesWithinShape(this.lineOfSight)) {
          if (tile.collides) {
            this.lineOfSight.setTo(this.x, this.y, (!this.flipX) ? tile.pixelX - 16 : tile.pixelX, this.y);
            break;
          }
        }
      }
      else {
        delete this.lineOfSight;
      }
      if (this.alive && !this.stunned) {
        if (noAI === false) { // Ignored if noAI is true.
          // Stuff for when the zombies sees the player:
          this.seesPlayerRight = (
            (this.x < target.x && !this.flipX) &&
            this.lineOfSight.x2 >= target.x &&
            Math.abs(this.y - target.y) <= 16 &&
            target.alive
          );
          this.seesPlayerLeft = (
            (this.x > target.x && this.flipX) &&
            this.lineOfSight.x2 <= target.x &&
            Math.abs(this.y - target.y) <= 16 &&
            target.alive
          );
          // Movement conditionals, ignored if noTarget is enabled:
          if (this.seesPlayerLeft && !noTarget) {
            this.go(-this.speed);
            this.lineOfSight.setTo(this.x, this.y, target.x, target.y);
            parentThis.graphics.lineStyle(2, 0x00FF00, 1);
          }
          else if (this.seesPlayerRight && !noTarget) {
            this.go(this.speed);
            this.lineOfSight.setTo(this.x, this.y, target.x, target.y);
            parentThis.graphics.lineStyle(2, 0x00FF00, 1);
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

    parentThis.physics.add.collider(this, platforms);
    if (player.alive) {
      this.collisionArgs = [player, this, player.getHit, null, parentThis]
      this.collider = parentThis.physics.add.overlap(...this.collisionArgs);
      player.colliders[this.id] = this.collider;
    }
    this.getHit = (target1, punchObject) => {
      // When a zombie gets hit, e.g. by a punch.
      target1.stun(400);
      target1.setVelocityY(-150);
      let velocity = 250 + Math.abs(player.body.velocity.x)*1.5;
      console.log(velocity);
      target1.body.velocity.x = (player.flipX) ? -velocity : velocity;
      punchObject.destroy();
      parentThis.physics.world.removeCollider(this.collider);
      parentThis.physics.world.removeCollider(this.punchCollider);
      target1.die();
      zombiesAlive--;
      player.addScore(100 + parseInt(Math.abs(player.body.velocity.x)/2));
      player.addKill();
    }
    // Adding punch collision:
    this.punchboxArgs = [this, punchboxes, this.getHit, null, parentThis];
    this.punchCollider = parentThis.physics.add.overlap(...this.punchboxArgs);
    
    this.changeDir = (node) => {
      if (this.wandering && this.body.blocked.down) {
        if (this.x <= node.x) {
          wanderDirection = true;
        }
        else if (this.x > node.x) {
          wanderDirection = false;
        }
      }
    }

    this.edgeDetectorArgs = [
      this, edgeNodes, this.changeDir, null, parentThis
    ];
    let edArgs = this.edgeDetectorArgs;
    this.edgeDetector = parentThis.physics.add.overlap(...edArgs);
    zombies.push(this);
  }
}

function CreateRandomZombie() {
  if (zombiesAlive >= 10) return;
  zombiesAlive++;
  let randomSpawn = parseInt(Math.random() * zombieSpawnpoints.length);
  let x = zombieSpawnpoints[randomSpawn][0];
  let y = zombieSpawnpoints[randomSpawn][1];
  new Zombie(parentThis, x, y);
}

///////////////////////////////////////////////////////////////////////////////


//- src\pickupables\genericPickupable.js -/////////////////////////////////////

// Array for storing the pickupables:
let pickupables = [];
// Used when generating overlap colliders.

function mixinPickupableMethods(p, sprite, destructTime) {
  // Mixin for generic pickupable methods.

  p.pickup = (player, child) => {
    player.addScore(250);
    parentThis.sound.play('pickup');
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
    let position = pickRandomSprite(ValidItemSpawnAreas);
    let distArgs = [position[0], position[1], player.x, player.y];
    // Prevents items from spawning on the player:
    while (calculateDistance(...distArgs) < 32) {
      position = pickRandomSprite(ValidItemSpawnAreas);
      distArgs = [position[0], position[1], player.x, player.y];
    }
    p.spawn(...position);
  }

  pickupables.push(p);

}

///////////////////////////////////////////////////////////////////////////////


//- src\main.js -//////////////////////////////////////////////////////////////

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
  scene: [loadingScene, titleScene, levelIntroScene, mainScene, pausedScene]
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

// Booleans for toggling features (or cheating lol):
let noAI = false;
let noTarget = false;
let spawnEnemies = true;
let skipTitle = true;
let showVisionRays = true;

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

///////////////////////////////////////////////////////////////////////////////