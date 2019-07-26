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
    console.log('Game over conditional triggered!');
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
    // Cleanup for dead zombies in the zombies array.
    enemiesAlive = enemiesAlive.filter(x => x.destroyed == false);
    enemiesFilter = false;
  }

  //

}