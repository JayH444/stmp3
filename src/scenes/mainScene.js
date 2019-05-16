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
  console.log(map);
  platforms.setCollisionByProperty({collides: true});

  // Entity creation code:

  window.ValidItemSpawnAreas = [];

  for (let row of map.layers[0].data) {  // Basically finds if a tile is grass.
    for (let tile of row) {
      if (tile.index == 2) {
        ValidItemSpawnAreas.push([tile.x * 16 - 8, (tile.y-1) * 16 + 8]);
      }
    }
  }

  for (let area of ValidItemSpawnAreas) {  // Generates random grass.
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
    //eval(`${i.properties[0].value}(${i.x-16}, ${i.y-8})`);
  }

  //

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

  // Zombie spawner:
  
  let timerArgs = {delay: 3000, callback: CreateRandomZombie, repeat: -1};
  zombieTimer = this.time.addEvent(timerArgs);
  

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

  parentThis.graphics.clear(); // Clears the last graphics drawn.

  // Monster stuff:

  if (!spawnEnemies && zombieTimer.paused == false) {
    zombieTimer.paused = true;
  }
  else if (spawnEnemies && zombieTimer.paused == true) {
    zombieTimer.paused = false;
  }

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

  //

}