// Todo: clean up code (more functional/OOP), add level tilemap and
// level generation, add health pickups, add coins.

// Phaser configuration:
const config = {
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
  init: init,
  scene: {
    preload: preload,
    create: create,
    update: update
  },
};

// Global vars:

let showDebug = false;

let game = new Phaser.Game(config);
let centerX = config.width/2;
let centerY = config.height/2;
let player;
let zombies;
let platforms;
let cursors;
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
  // Adds a text element to be displayed.
  textArr.push([str, x, y, id]);
}

function destroyText(key) {
  // Removes a text element.
  for (let i of textObjects[key]) {
    i.destroy();
  }
  delete textObjects[key];
}

function debuggingMenu() {
  // Constructor for creating a debug menu.
  let dbMenu = document.getElementById("debug-menu"); 
  this.getPlayerPos = () => {
    dbMenu.children[0].innerHTML = 'Player X: ' + Math.round(player.x*10)/10;
    dbMenu.children[1].innerHTML = 'Player Y: ' + Math.round(player.y*10)/10;
  };
}

function createActor(actor, name, speed) {  
  // Mixin for creating general actor methods and properties.
  actor.name = name;
  actor.body.setGravityY(500);
  actor.body.setSize(10, 16);
  actor.drag = 0.25;
  actor.speed = speed;
  actor.alive = true;
  actor.health = 3;
  // Animation speed scales with actor's movement speed:
  actor.animSpeed = parseInt(0.09375 * actor.speed);

  actor.decayVelocityX = (arg) => {  // Actor velocity decay from drag.
    decayRatio = arg;
    if (!actor.body.touching.down) {  // Less drag if actor in air.
      decayRatio *= 1.75;
    }
    actor.body.velocity.x = parseInt(actor.body.velocity.x * decayRatio);
  }

  actor.moveX = (speed, inertia) => {
    if (Math.abs(actor.body.velocity.x) < Math.abs(speed)) {
      actor.body.velocity.x += (speed * inertia);
    } else {
      actor.body.velocity.x = speed;
    }
  }

  actor.die = () => {
    actor.alive = false;
    actor.health = 0;
    actor.anims.play(actor.name + 'Die');
    if (actor.collision) actor.collision.destroy();
  }


  if (!parentThis.anims.get(actor.name + 'Move')) {
    // If the animation object doesn't already 
    // contain these animations, create them.
    parentThis.anims.create({
      key: actor.name + 'Move',
      frames: parentThis.anims
        .generateFrameNumbers(actor.name, {start: 1, end: 2}),
      frameRate: actor.animSpeed,
      repeat: -1
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

function getHit(target1, target2) {
  // Function that executes when collision 
  // between target1 and target2 occurs.
  let target1FeetY = parseInt(target1.y + target1.body.sourceHeight/2);
  let targetHeadY = parseInt(target2.y - target2.body.sourceHeight/2);
  if (target1FeetY <= targetHeadY + 4) {
    // target1 is above target2 (headstomp)
    this.sound.play('punch');
    parentThis.physics.world.removeCollider(target1.colliders[target2.id]);
    if (target1.hasOwnProperty('addScore')) {
      target1.addScore(100);
    }
    target2.die();
    target1.setVelocityY(-250);
  } 
  else {
    target1.setVelocityY(-150);
    if (!target1.stunned) {
      // Stuns target1 so they can't move and don't take further damage.
      this.sound.play('punch');
      target1.health--;
      if (target1.hb.length) {
        target1.hb[0].destroy();
        target1.hb.shift();
      }
    }
    target1.stun(this);
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
      for (let collider in target1.colliders) {
        parentThis.physics.world.removeCollider(target1.colliders[collider]);
      }
      // Destroys the contents of colliders since target1 is dead:
      target1.colliders = {};
      target1.die();
    }
  }
}

zombies = [];
zombieUsedIDs = [];
function createZombie(startPosX=true) {
  if (startPosX === true) {
    startPosX = (randBool) ? -32 : config.width + 32;
  }
  let spriteArgs = [startPosX, config.height - 24, 'zombie'];
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
  zed.move = (posX, targetX) => {  // Zombie AI.
    if (zed.alive) {
      if (posX < targetX - 2) {
        zed.moveX(zed.speed, zed.drag);
        zed.flipX = false;
        zed.anims.play('zombieMove', true);
      }
      else if (posX > targetX + 2) {
        zed.moveX(-zed.speed, zed.drag);
        zed.flipX = true;
        zed.anims.play('zombieMove', true);
      }
      else {
        zed.decayVelocityX(0.5);
        zed.anims.play('zombieIdle', true);
      }
    }
    else {
        zed.decayVelocityX(0.5);
    }
  }
  createActor(zed, 'zombie', 40, parentThis);
  // Gives a zombie a random speed:
  zed.speed *= 1 + (Math.random() - 0.5) / 7;
  parentThis.physics.add.collider(zed, platforms);
  if (player.alive) {
    zed.collisionArgs = [player, zed, getHit, null, parentThis]
    zed.collider = parentThis.physics.add.overlap(...zed.collisionArgs);
    player.colliders[zed.id] = zed.collider;
  }
  zombies.push(zed);
}

let debugMenu = new debuggingMenu();

// Initialization for pixel scaling:

function init() {
  game.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;
  game.scale.setUserScale(4, 4);
  // enable crisp rendering
  game.renderer.renderSession.roundPixels = true;
  Phaser.Canvas.setImageRenderingCrisp(this.game.canvas);
}

// Main game functions & loop:

function preload() {

  //Images and sound effects:
  this.load.image('sky', 'assets/sky.png');
  this.load.image('platform', 'assets/platform.png');
  this.load.image('scoreboard', 'assets/scoreboard.png');
  this.load.image('heart', 'assets/heart.png');

  // Font spritesheet uses ASCII values minus 32.
  this.load.spritesheet('fontmap', 'assets/font.png', 
    {frameWidth: 8, frameHeight: 8}
  );
  // Player spritesheet:
  this.load.spritesheet('player', 'assets/dude.png', 
    {frameWidth: 16, frameHeight: 16}
  );
  // Zombie spritesheet:
  this.load.spritesheet('zombie', 'assets/zombie.png',
    {frameWidth: 16, frameHeight: 16}
  );

  // Sound effects:
  this.load.audio('jump', 'sfx/jump.wav');
  this.load.audio('punch', 'sfx/punch1.wav');
}

function create() {
  parentThis = this;

  this.bg = this.add.tileSprite(0, 0, 800, 600, 'sky');

  platforms = this.physics.add.staticGroup();
  platforms.create(centerX, config.height - 8, 'platform');
  platforms.create(centerX, 8, 'scoreboard');

  // Actor stuff & animations:

  player = this.physics.add.sprite(centerX, config.height - 24, 'player');
  createActor(player, 'player', 160, this);
  player.setCollideWorldBounds(true);
  player.score = 0;
  player.getScore = () => player.score.toString().padStart(7, "0");
  player.holdingJump = false;
  player.holdingPunch = false;
  player.stunned = false;
  player.hasPunched = false;
  player.punchCoolDown = 0;
  player.punchAnimPlay = 0;
  player.hb = [];
  player.addScore = (points) => {
    player.score += points;
    textObjects.playerScore.forEach((img, i) => {
      img.setTexture('fontmap', player.getScore()[i].charCodeAt(0) - 32);
    });
  }
  // Player health bar:
  for (let i = 0; i < player.health; i++) {
    let pos = config.width - 8 - (i * 16);
    player.hb.unshift(this.add.image(pos, 8, 'heart'));
  }

  player.stun = function() {
    player.stunned = true;
    let timerFunc = () => {player.stunned = false;}
    var timer = parentThis.time.delayedCall(200, timerFunc);
  }

  this.physics.add.collider(player, platforms);
  //this.physics.add.collider(zombie, platforms);

  // Collision detection for player and zombies:
  player.colliders = {};
  for (let zed of zombies) {
    zed.collisionArgs = [player, zed, getHit, null, this]
    zed.collider = this.physics.add.overlap(...zed.collisionArgs);
    player.colliders[zed.id] = zed.collider;
  }

  // Loop for drawing text on the screen:
  // (All text must go BEFORE this to be rendered.)
  printText('SCORE:', 8, 8, 'scoreText');
  printText(player.getScore(), 8 + 48, 8, 'playerScore')

  // Renders the text:
  for (let i of textArr) {
    // TextArr format: [string, x, y, id]
    let offset = i[1];
    let wordImages = [];
    for (let letter of i[0]) {
      let charCode = letter.charCodeAt(0) - 32;
      wordImages.push(this.add.image(offset, i[2], 'fontmap', charCode));
      offset += 8;  // Offset for each respective letter.
    }
    textObjects[i[3]] = wordImages;
  }

  let zombieSpawner = setInterval(createZombie, 3000);

}

function update() {
  parentThis = this;
  randBool = Phaser.Math.Between(0, 1);

  // This creates the keybinds:
  cursors = this.input.keyboard.addKeys({
    up: Phaser.Input.Keyboard.KeyCodes.W,
    down: Phaser.Input.Keyboard.KeyCodes.S,
    left: Phaser.Input.Keyboard.KeyCodes.A,
    right: Phaser.Input.Keyboard.KeyCodes.D,
    b: Phaser.Input.Keyboard.KeyCodes.SPACE,
    a: Phaser.Input.Keyboard.KeyCodes.CTRL,
    pause: Phaser.Input.Keyboard.KeyCodes.P
  });

  // Player input and animations conditionals:
  if (player.alive) {
    if (!(cursors.left.isDown && cursors.right.isDown) && !player.stunned) {
      player.inAir = player.body.touching.down && cursors.a.isDown
      if (cursors.left.isDown && !player.inAir) {
        player.moveX(-player.speed, player.drag);
        player.flipX = true;
        player.anims.play('playerMove', true);
      }
      else if (cursors.right.isDown && !player.inAir) {
        player.moveX(player.speed, player.drag);
        player.flipX = false;
        player.anims.play('playerMove', true);
      }
      else {
        player.decayVelocityX(0.5);
        player.anims.play('playerIdle');
      }
    }
    else {
      player.decayVelocityX(0.5);
      player.anims.play('playerIdle');
    }

    if (!player.body.touching.down) {
      player.anims.play('playerJump');
    }

    if (cursors.a.isDown && player.punchCoolDown == 0) {
      if (!player.hasPunched) {
        this.sound.play('punch');
        player.addScore(10);
        player.punchCoolDown = 5;
        player.hasPunched = true;
      }
    }
    else if (cursors.a.isUp) {
      if (player.hasPunched) {
        player.punchCoolDown--;
        if (player.punchCoolDown <= 0) {
          player.hasPunched = false;
          player.punchAnimPlay = 0;
        }
      }
    }
    if (player.hasPunched && player.punchAnimPlay < 7) {
      player.anims.play('playerPunch');
      player.punchAnimPlay++;
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
  }
  else {
    player.decayVelocityX(0.55);
  }

  for (let zombie of zombies) {
    zombie.move(zombie.x, player.x);
  }

  if (showDebug) {
    debugMenu.getPlayerPos();
  }
}
