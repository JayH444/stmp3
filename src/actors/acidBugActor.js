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
      if (this.alive) {
        // This controls the acidBug's LoS raycast.
        let flipTernary = (this.flipX) ? 0 : config.width;
        this.lineOfSight.setTo(this.x, this.y, flipTernary, this.y);
        let tilesWithinShape = map.getTilesWithinShape(this.lineOfSight);
        let i = (this.flipX) ? tilesWithinShape.length - 1 : 0;
        while ((this.flipX) ? i > -1 : i < tilesWithinShape.length) {
          // If the acidBug is facing left, then the tiles within the line 
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
      if (this.alive && !this.stunned) {
        if (noAI === false) {  // Ignored if noAI is true.
          // Stuff for when the acidBugs sees the player:
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
          let pastLeftBorder = this.x > this.width/2 - 2
          let pastRightBorder = this.x < config.width - this.width/2 + 2;
          let onScreen = pastLeftBorder && pastRightBorder;
          if (this.seesPlayerLeft && !noTarget) {
            if (Math.abs(this.x - target.x) <= 64 && onScreen) {
              this.spitAttack();
            }
            else {
              this.go(-this.speed);
            }
            this.lineOfSight.setTo(this.x, this.y, target.x, target.y);
            parentThis.graphics.lineStyle(2, 0x00FF00, 1);
          }
          else if (this.seesPlayerRight && !noTarget) {
            if (Math.abs(this.x - target.x) <= 64 && onScreen) {
              this.spitAttack();
            }
            else {
              this.go(this.speed);
            }
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