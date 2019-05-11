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
      if (this.alive && !this.stunned) {
        // Stuff for when the zombies sees the player:
        if (noAI === false) {
          this.seesPlayerRight = (
            (this.x < target.x && !this.flipX) &&
            Math.abs(this.y - target.y) <= 30 &&
            target.alive
          );
          this.seesPlayerLeft = (
            (this.x > target.x && this.flipX) &&
            Math.abs(this.y - target.y) <= 30 &&
            target.alive
          );
          // Movement conditionals:
          if (this.seesPlayerLeft && !noTarget) {
            this.go(-this.speed);
          }
          else if (this.seesPlayerRight && !noTarget) {
            this.go(this.speed);
          }
          else {
            this.wander();
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
  zombies.push(new Zombie(parentThis, x, y));
}