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