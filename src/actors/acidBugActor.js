class AcidBug extends Actor {
  // Creates a acidBug.
  constructor(scene, x, y) {
    let superArgs = [
      scene, x, y,
      'acidBug',
      80 * (1 + (Math.random() - 0.5) / 7),  // Movement speed randomizer.
      'acidBug',  // Name is the same as texture.
      false,  // Doesn't collide with world bounds.
    ];
    super(...superArgs);
    this.standingAtTarget = false;
    this.nodeTouched = false;
    this.chasing = false;
    this.animSpeed *= 3;
    this.seesTarget = false;
    this.wandering = true;
    let losArgs = [this.x, this.y, (this.flipX) ? 0 : config.width, this.y];
    this.lineOfSight = new Phaser.Geom.Line(...losArgs);

    // -- AcidBug AI stuff -- //

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
      // When the bug isn't pursuing the player.
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
      this.anims.play('acidBugMove', true);
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
        if (noAI === false) { // Ignored if noAI is true.
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

    // -- End Acid bug AI -- //

    parentThis.physics.add.collider(this, platforms);
    this.getHit = (target1, punchObject) => {
      // When a acidBug gets hit, e.g. by a punch.
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
    this.punchboxArgs = [this, punchboxes, this.getHit, null, parentThis];
    this.punchCollider = parentThis.physics.add.overlap(...this.punchboxArgs);
    
    // Player collision stuff:
    this.collisionArgs = [player, this, player.getHit, null, this]
    this.collider = parentThis.physics.add.overlap(...this.collisionArgs);
    
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

    this.edgeDetectorArgs = [
      this, edgeNodes, this.changeDir, null, parentThis
    ];
    let edArgs = this.edgeDetectorArgs;
    this.edgeDetector = parentThis.physics.add.overlap(...edArgs);
    enemiesAlive.push(this);
  }
}

function CreateRandomAcidBug() {
  let randomSpawn = parseInt(Math.random() * enemySpawnpoints.length);
  let x = enemySpawnpoints[randomSpawn][0];
  let y = enemySpawnpoints[randomSpawn][1];
  new AcidBug(parentThis, x, y);
}