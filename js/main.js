"use strict";

// Todo: clean up code (more functional/OOP), add
// random level generation, make items not spawn on player, fix minor
// punch repeating bug.

// Phaser scenes and configuration:

 // For some reason, preload, create, etc has to use normal function syntax
 // instead of arrow functions. IT WILL NOT WORK OTHERWISE!!!

let mainScene = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize: function mainScene() {
    Phaser.Scene.call(this, {key: 'mainScene'});
  },
  preload: preload,
  create: create,
  update: update
});


let pausedScene = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize: function pausedScene () {
    Phaser.Scene.call(this, {key: 'pausedScene'});
  },
  preload: function () {
  },
  create: function () {
    printText('PAUSED', centerX-20, centerY, 'pauseText');
    this.input.keyboard.on('keydown_P', function () {
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
    }, this);
  },
  update: function () {
  }
});


var config = {
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
  //init: init,
  scene: [mainScene, pausedScene]
};

// Initialization for pixel scaling:

function init() {
  game.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;
  // game.scale.setUserScale(4, 4);
  // enable crisp rendering
  game.renderer.renderSession.roundPixels = true;
  Phaser.Canvas.setImageRenderingCrisp(this.game.canvas);
}


// Main game functions & loop:


function preload() {

  //Images and sound effects:
  let fs = require('fs');
  let files = fs.readdirSync('../Dev/GameData/assets');
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

  files = fs.readdirSync('../Dev/GameData/sfx');
  for (let file of files) {
    // Loop for loading the sounds in the sfx directory.
    // Automatically names them.
    // Uses \w+ just in case there's any weird sound file extensions:
    let pattern = /(\w+)\.\w+/;
    this.load.audio(file.match(pattern)[1], 'sfx/' + file);
  }
}


// Global vars:

let showDebug = false;

let game = new Phaser.Game(config);
let centerX = config.width/2;
let centerY = config.height/2;
let player;
let coins;
let food;
let platforms;
let grass;
let punchboxes;
let edgeNodes;
let cursors;
let paused = false;
let parentThis;
let randBool = true;
let textArr = [];  // Array for storing texts to be displayed on screen.
let textObjects = {};  // Object for storing the displayed texts.
// Note that textObjects just serves as pointers to the letter image objects.
// Removing an key from it or reassigning letters in key's value 
// has no effect on the image objects. 
// To delete a single letter, use destroy().


// Global functions:


function printText(str, x, y, id) {
  // Prints a text element to the scene and puts it in the textObjects array.
  let offset = x;
  let wordImages = [];
  for (let letter of str) {
    let charCode = letter.charCodeAt(0) - 32;
    wordImages.push(parentThis.add.image(offset, y, 'fontmap', charCode));
    offset += 8;  // Offset for each respective letter.
  }
  textObjects[id] = wordImages;
}

function destroyText(key) {
  // Removes a text element.
  for (let i of textObjects[key]) {
    i.destroy();
  }
  delete textObjects[key];
}

function calculateDistance(target1x, target1y, target2x, target2y) {
  // Calculates the absolute distance between two targets.
  let deltaXSquared = Math.pow(Math.abs(target1x - target2x), 2);
  let deltaYSquared = Math.pow(Math.abs(target1y - target2y), 2);
  return Math.round(Math.sqrt(deltaXSquared + deltaYSquared));
}

function debuggingMenu() {
  // Constructor for creating a debug menu.
  let dbMenu = document.getElementById("debug-menu"); 
  this.getPlayerPos = () => {
    dbMenu.children[0].innerHTML = 'Player X: ' + Math.round(player.x*10)/10;
    dbMenu.children[1].innerHTML = 'Player Y: ' + Math.round(player.y*10)/10;
  };
}

function pickRandomSprite(arr) {
  return Phaser.Math.RND.pick(arr);
}


function createActor(actor, name, speed) {  
  // Mixin for creating general actor methods and properties.
  actor.name = name;
  actor.body.setGravityY(500);
  actor.body.setSize(8, 16);
  actor.drag = 0.25;
  actor.velocityDecay = 0.5;
  actor.speed = speed;
  actor.alive = true;
  actor.health = 3;
  actor.stunned = false;
  actor.invul = false;
  actor.flickerTimer = 0;
  actor.destroyed = false;
  // Invulnerability period after getting hit (in ms):
  actor.invulPeriod = 1500;
  // Animation speed scales with actor's movement speed:
  actor.animSpeed = parseInt(0.09375 * actor.speed);

  actor.goIdle = (arg) => {
    actor.decayVelocityX(arg);
    actor.anims.play(actor.name + 'Idle');
  }

  actor.decayVelocityX = (arg=0.5) => {  // Actor velocity decay from drag.
    if (actor.destroyed) return;
    let decayRatio = arg;
    if (!actor.body.touching.down) {  // Less drag if actor in air.
      decayRatio *= 1.75;
    }
    actor.body.velocity.x = parseInt(actor.body.velocity.x * decayRatio);
  }

  actor.moveX = (speed, inertia) => {
    if (actor.destroyed) return;
    if (!actor.stunned) {
      if (Math.abs(actor.body.velocity.x) < Math.abs(speed)) {
        actor.body.velocity.x += (speed * inertia);
      } 
      else {
        actor.body.velocity.x = speed;
      }
    }
    else {
      actor.decayVelocityX();
    }
  }

  actor.die = () => {
    actor.visible = true;
    actor.alive = false;
    actor.health = 0;
    actor.anims.play(actor.name + 'Die');
    if (actor.collision) actor.collision.destroy();
    parentThis.time.delayedCall(1000, () => actor.destroyed = true);
    //parentThis.time.delayedCall(5000, () => actor.destroy());
  }

  actor.stun = (time, invulnerable=false) => {
    actor.stunned = true;
    parentThis.time.delayedCall(time, () => actor.stunned = false);
    if (invulnerable) {
      parentThis.time.delayedCall(50, () => actor.invul = true);
      let a = [actor.invulPeriod, () => actor.invul = false]
      parentThis.time.delayedCall(...a);
    }
  }

  actor.flicker = () => {
    if (actor.flickerTimer == 0) {
      actor.visible = !actor.visible;
      actor.flickerTimer = 4;
    } else {
      actor.flickerTimer--;
    }
  }

  actor.playSoundPunch = () => {
    let s = pickRandomSprite(['punch1', 'punch2', 'punch3']);
    parentThis.sound.play(s);
  }

  actor.getHit = (target1, target2) => {
    // Function that executes when collision 
    // between target1 and target2 occurs.
    if (target2.body.touching.up) {
      // target1 is above target2 (headstomp)
      actor.playSoundPunch();
      parentThis.physics.world.removeCollider(target1.colliders[target2.id]);
      if (target1.hasOwnProperty('addScore')) {
        target1.addScore(100);
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
          actor.playSoundPunch();
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

  if (!parentThis.anims.get(actor.name + 'Move')) {
    // If the animation object doesn't already 
    // contain these animations, create them.
    parentThis.anims.create({
      key: actor.name + 'Move',
      frames: parentThis.anims
        .generateFrameNumbers(actor.name, {start: 1, end: 2}),
      frameRate: actor.animSpeed,
      repeat: -1,
      loop: true
    });

    parentThis.anims.create({
      key: actor.name + 'Idle',
      frames: [{key: actor.name, frame: 0}],
      frameRate: 10
    });

    parentThis.anims.create({
      key: actor.name + 'Die',
      frames: [{key: actor.name, frame: 5}],
      frameRate: 10
    });

    parentThis.anims.create({
      key: actor.name + 'Jump',
      frames: [{key: actor.name, frame: 1}],
      frameRate: 10
    });

    parentThis.anims.create({
      key: actor.name + 'Punch',
      frames: [{key: actor.name, frame: 4}],
      frameRate: 10
    });
  }
}


// Becomes true if a destroyed zombie is detected in the zombies array:
let zombiesFilter = false;
// Array for storing alive zombies to be iterated over for movement:
let zombies = [];
let zombieUsedIDs = [];
let zombiesAlive = 0;
let zombieTimer;
let zombieSpawnpoints = [];


function createZombie(timer, x=0, y=0, random=true) {
  // Creates a zombie. startPos is a tuple of the 
  // Prevents more than ten zombies at a time from spawning:
  if (zombiesAlive >= 10) return;
  zombiesAlive++;
  if (random) {
    // Selects a random spawnpoint out of the list of spawnpoints:
    let randomSpawn = parseInt(Math.random() * zombieSpawnpoints.length);
    [x, y] = zombieSpawnpoints[randomSpawn];
  }
  let spriteArgs = [x, y, 'zombie'];
  let zed = parentThis.physics.add.sprite(...spriteArgs);
  // Generates an ID for the zombies to be addressed by.
  // Technically will encounter problems if the count gets too high, 
  // but by that point you got bigger issues anyway...
  let IDNum = parseInt(Math.random() * 1000000);
  while (zombieUsedIDs.includes(IDNum)) {
    // Just in case the ID is already used...
    IDNum = parseInt(Math.random() * 1000000);
  }
  zed.id = IDNum;
  zombieUsedIDs.push(IDNum);
  zed.setCollideWorldBounds(false);
  zed.standingAtTarget = false;
  zed.nodeTouched = false;
  zed.chasing = false;
  zed.seesTarget = false;
  zed.wandering = true;
  createActor(zed, 'zombie', 40, parentThis);
  // Gives a zombie a random speed:
  zed.speed *= 1 + (Math.random() - 0.5) / 7;

  // Zombie AI stuff:
  zed.lastx = zed.x;
  zed.updateLastX = () => {
    zed.lastx = zed.x;
  }
  let posTimerArgs = {delay: 200, callback: zed.updateLastX, repeat: -1};
  zed.positionTimer = parentThis.time.addEvent(posTimerArgs);

  let wanderDirection = false;  // false == right, true == left
  zed.newWanderDir = () => {
    wanderDirection = Boolean(Phaser.Math.Between(0, 1));
  }
  zed.wanderTimerArgs = {delay: 2000, callback: zed.newWanderDir, repeat: -1};
  zed.wanderTimer = parentThis.time.addEvent(zed.wanderTimerArgs);

  zed.wander = () => {
    // When the zombie isn't pursuing the player.
    zed.wandering = true;
    let movementVector = (wanderDirection) ? -zed.speed : zed.speed;
    //let validMovementRange = zed.x > zed.width;
    if (zed.wanderTimer.elapsed < 1700) {
      if (zed.x <= zed.width/2 - 2) {
        wanderDirection = false;
      }
      else if (zed.x >= config.width - zed.width/2 + 2) {
        wanderDirection = true;
      }
      zed.go(movementVector);
    }
    else {
      zed.goIdle();
    }
  }
  
  zed.go = (speed) => {
    zed.moveX(speed, zed.drag);
    zed.anims.play('zombieMove', true);
    zed.flipX = (speed < 0) ? true : false;
  }
  
  zed.move = (target) => {  // Zombie movement AI.
    if (zed.alive) {
      // Stuff for when the zombies sees the player:
      zed.seesPlayerRight = (
        (zed.x < target.x && !zed.flipX) &&
        Math.abs(zed.y - target.y) <= 30 &&
        target.alive
      );
      zed.seesPlayerLeft = (
        (zed.x > target.x && zed.flipX) &&
        Math.abs(zed.y - target.y) <= 30 &&
        target.alive
      );
      // Movement conditionals:
      if (zed.seesPlayerLeft) {
        zed.go(-zed.speed);
      }
      else if (zed.seesPlayerRight) {
        zed.go(zed.speed);
      } else {
        zed.wander();
      }
      let touchingWall = zed.body.touching.left || zed.body.touching.right;
      if (touchingWall && zed.x == zed.lastx) {
        // If touching a wall and not moved since last position...
        zed.setVelocityY(-125);
      }
    }
    else {
      if (zed.body.collideWorldBounds) {
        zed.setCollideWorldBounds(false);
      }
        if (!zed.destroyed) {
          zed.decayVelocityX();
        }
    }
  }

  parentThis.physics.add.collider(zed, platforms);
  if (player.alive) {
    zed.collisionArgs = [player, zed, player.getHit, null, parentThis]
    zed.collider = parentThis.physics.add.overlap(...zed.collisionArgs);
    player.colliders[zed.id] = zed.collider;
  }
  zed.getHit = (target1, target2) => {
    // When a zombie gets hit, e.g. by a punch.
    target1.stun(400);
    target1.setVelocityY(-150);
    let velocity = 400 + Math.abs(player.body.velocity.x)*2;
    target1.body.velocity.x = (player.flipX) ? -velocity : velocity;
    target2.destroy();
    parentThis.physics.world.removeCollider(zed.collider);
    parentThis.physics.world.removeCollider(zed.punchCollider);
    target1.die();
    zombiesAlive--;
    player.addScore(100 + parseInt(Math.abs(player.body.velocity.x)/2));
  }
  // Adding punch collision:
  zed.punchboxArgs = [zed, punchboxes, zed.getHit, null, parentThis];
  zed.punchCollider = parentThis.physics.add.overlap(...zed.punchboxArgs);
  
  zed.changeDir = (zed, node) => {
    if (zed.wandering && zed.body.touching.down) {
      if (zed.x <= node.x) {
        wanderDirection = true;
      }
      else if (zed.x > node.x) {
        wanderDirection = false;
      }
    }
  }

  zed.edgeDetectorArgs = [zed, edgeNodes, zed.changeDir, null, parentThis];
  zed.edgeDetector = parentThis.physics.add.overlap(...zed.edgeDetectorArgs);
  zombies.push(zed);
}

function createZombieSpawn(x, y) {
  zombieSpawnpoints.push([x, y])
}

let debugMenu = new debuggingMenu();

// Tilemap for the level:

/*
  Levels consist of an array from 15 strings forming the rows,
  where each character represents a 16x16 pixel tile. 
  There are 22 columns total, 20 of which are visible.
  The remaining 4 are for offscreen things like zombie spawners
  and offscreen platforms for the zombies to stand on.

  Legend:
  
  Scoreboard = s,
  Ground w/ grass = g,
  Ground w/o grass (rocks) = r,
  Nothing (sky) = n,
  Edge node left (for NPCs) = e
 */

let level = [
  'ssssssssssssssssssssss',
  'nnnnnnnnnnnnnnnnnnnnnn',
  'nnnnnnnnnnnnnnnnnnnnnn',
  'znnnnnnnnennnnnnnnnnnz',
  'gggggggggnnnnnnnnngggg',
  'rrrrrrrnnnngnnnnnnnrrr',
  'rrnnnnnnnnnnnngnnnnnrr',
  'nnnnnnnnnnnnnnrgnnnnnn',
  'nnnnnnnnnnnnnnnnnnnnnz',
  'nnnnnnnnnnnnnngggggggg',
  'nngnnnnnennnggrrnnnnnn',
  'nnnnnnnnngggrnnnnnnnnn',
  'nnnnnngnnnnnnnnnnnnnnn',
  'znnnnnnnnnnnngnnnnnnnz',
  'gggggggggggggrgggggggg'
];

let spriteForKey = {
  g: 'groundgrass', r: 'ground', s: 'scoreboard',
};
let functionForKey = {
  z: createZombieSpawn, e: createEdgeNode
};

function createEdgeNode(x, y) {
  edgeNodes.create(x, y, 'edgenode');
}

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

function create() {
  parentThis = this;

  this.bg = this.add.tileSprite(0, 0, 800, 600, 'sky');

  platforms = this.physics.add.staticGroup();
  punchboxes = this.physics.add.staticGroup();
  edgeNodes = this.physics.add.staticGroup();
  grass = this.physics.add.staticGroup();

  for (let i = 0; i < level.length; i++) {
    let row = level[i];
    for (let j = 0; j < row.length; j++) {
      let x = 16*j - 8;
      let y = 16*i + 8;
      if (spriteForKey.hasOwnProperty(row[j])) {
        platforms.create(x, y, spriteForKey[row[j]]);
      }
      else if (functionForKey.hasOwnProperty(row[j])) {
        functionForKey[row[j]](x, y);
      }
      else if (row[j] != 'n') {
        let message = 'Unknown map element "' + row[j] + '"' +
          ' at row ' + (i+1) + ', col ' + (j+1) + '.';
        console.log(message);
      }
    }
  }

  for (let area of ValidItemSpawnAreas) {
    let ranSprite = pickRandomSprite(['grass1', 'grass2']);
    grass.create(area[0], area[1], ranSprite);
  }

  // Pickupables:

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

  coins = this.physics.add.group();
  coins.setDepth(0, 0);

  mixinPickupableMethods(coins, 'coin', 5000)

  let csArgs = {delay: 15000, callback: coins.spawnRandom, repeat: -1};
  let coinSpawner = this.time.addEvent(csArgs);

// Food spawning:

  food = this.physics.add.group();
  food.setDepth(0, 0);

  mixinPickupableMethods(food, 'burger', 10000)

  food.pickup = (player, burger) => {
    player.addScore(500);
    player.addHealth();
    parentThis.sound.play('gethealth');
    food.remove(burger, true, true);
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


  // Actor stuff:

  player = this.physics.add.sprite(centerX, config.height - 24, 'player');
  createActor(player, 'player', 160, this);
  player.setCollideWorldBounds(true);
  player.score = 0;
  player.getScore = () => player.score.toString().padStart(7, "0");
  player.holdingJump = false;
  player.holdingPunch = false;
  player.isPunching = false;
  player.punchAnimPlay = false;
  player.punchCoolingDown = false;
  player.hb = [];  // Array for pointers to the health bar images.
  player.addScore = (points) => {
    player.score += points;
    textObjects.playerScore.forEach((img, i) => {
      img.setTexture('fontmap', player.getScore()[i].charCodeAt(0) - 32);
    });
  };
  // Player health bar:
  for (let i = 0; i < player.health; i++) {
    let pos = config.width - 8 - (i * 16);
    player.hb.unshift(this.add.image(pos, 8, 'heart'));
  }

  player.addHealth = () => {
    if (player.health < 3) {
      player.health++;
      player.hb[3 - player.health].setVisible(true);
    }
    else {
      player.addScore(500);
    }
  }

  player.punch = () => {
    player.playSoundPunch();
    player.anims.play('playerPunch');
    player.isPunching = true;
    player.punchAnimPlay = true;
    player.punchCoolingDown = true;
    parentThis.time.delayedCall(100, () => player.punchAnimPlay = false);
    parentThis.time.delayedCall(200, () => player.punchCoolingDown = false);
    let CollisionX = (player.flipX) ? player.x - 10 : player.x + 10;
    let punchbox = punchboxes.create(CollisionX, player.y, 'punchbox');
    parentThis.time.delayedCall(100, () => punchbox.destroy());
  }

  this.physics.add.collider(player, platforms);
  for (let p of pickupables) {
    this.physics.add.collider(p, platforms);
    this.physics.add.overlap(player, p, p.pickup, null, parentThis);
  }

  // Collision detection for player and zombies:
  player.colliders = {};
  for (let zed of zombies) {
    zed.collisionArgs = [player, zed, player.getHit, null, this]
    zed.collider = this.physics.add.overlap(...zed.collisionArgs);
    player.colliders[zed.id] = zed.collider;
  }

  printText('SCORE:', 8, 8, 'scoreText');
  printText(player.getScore(), 8 + 48, 8, 'playerScore')

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

  let timerArgs = {delay: 3000, callback: createZombie, repeat: -1};
  zombieTimer = this.time.addEvent(timerArgs);
}


function update() {
  parentThis = this;

  if (cursors.p.isDown & !paused) {
    paused = true;
    this.scene.launch('pausedScene');
    this.scene.pause('mainScene');
  } 
  else {
      this.scene.resume('mainScene');
  }

  randBool = Phaser.Math.Between(0, 1);

  // Player input and animations conditionals:

  if (player.alive) {
    if (!(cursors.left.isDown && cursors.right.isDown)) {
      if (cursors.left.isDown) {
        player.moveX(-player.speed, player.drag);
        player.flipX = true;
        player.anims.play('playerMove', true);
      }
      else if (cursors.right.isDown) {
        player.moveX(player.speed, player.drag);
        player.flipX = false;
        player.anims.play('playerMove', true);
      }
      else {
        player.goIdle();
      }
    }
    else {
      player.goIdle();
    }

    if (!player.body.touching.down) {
      player.anims.play('playerJump');
    }

    if (cursors.a.isDown) {
      if (!player.isPunching) {
        player.punch();
      }
    }
    else if (cursors.a.isUp && !player.punchCoolingDown) {
      player.isPunching = false;
    }
    if (player.punchAnimPlay) {
      player.anims.play('playerPunch');
    }

    var onGround = player.body.touching.down;
    if (cursors.b.isDown && onGround && !player.holdingJump) {
      player.setVelocityY(-300);
      this.sound.play('jump');
      player.holdingJump = true;
    }
    else if (cursors.b.isUp) {
      player.holdingJump = false;
    }

    if (player.invul) {
      player.flicker();
    } else {
      player.visible = true;
    }
  }
  else {
    player.decayVelocityX(0.55);
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
  });

  if (zombiesFilter) {
    // Cleanup for dead zombies in the zombies array.
    zombies = zombies.filter(x => x.destroyed == false);
    zombiesFilter = false;
  }

  if (showDebug) {
    debugMenu.getPlayerPos();
  }
}
