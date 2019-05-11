// Main game scene and game loop.

class mainScene extends Phaser.Scene {
  constructor() {
    super({key: 'mainScene'});
    this.preload = preload;
    this.create = create;
    this.update = update;
  }
}

function preload() {  // Loads game assets.

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

  // Font spritesheet. Uses ASCII values minus 32.
  this.load.spritesheet('fontmap', 'assets/spritesheet_font.png', 
    {frameWidth: 8, frameHeight: 8}
  );
  // Player spritesheet:
  this.load.spritesheet('player', 'assets/spritesheet_dude.png', 
    {frameWidth: 16, frameHeight: 16}
  );
  // Zombie spritesheet:
  this.load.spritesheet('zombie', 'assets/spritesheet_zombie.png',
    {frameWidth: 16, frameHeight: 16}
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

  this.load.image('tiles', 'assets/game_tiles.png');

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

  zombies.forEach((zombie) => {
    if (zombie.destroyed && !zombiesFilter) {
      zombiesFilter = true;
      let ZedIdIndex = zombieUsedIDs.indexOf(zombie.id);
      // Removes dead zombie ID from used IDs:
      zombieUsedIDs.splice(ZedIdIndex, 1);
    } else {
      zombie.move(player);
    }
  });

  if (zombiesFilter) {
    // Cleanup for dead zombies in the zombies array.
    zombies = zombies.filter(x => x.destroyed == false);
    zombiesFilter = false;
  }

}