class Bat extends enemyActor {
  // Creates a bat.
  constructor(scene, x, y) {
    // Movement speed randomizer:
    let speed = 40 * (1 + (Math.random() - 0.5) / 7);
    let superArgs = [
      scene, x, y,
      'bat',
      speed,
      speed*3,  // Bat wings flap pretty quickly!
    ];
    super(...superArgs);

    this.body.setGravity(0, -500);
    this.body.setSize(8, 8);
    let losArgs = [this.x, this.y, (this.flipX) ? 0 : config.width, this.y];
    this.lineOfSight = new Phaser.Geom.Line(...losArgs);
    this.magnitude = speed;
    this.changeFlightDirection = true;
    this.flightDirection = 0;  // In radians.
    this.dodgeDirection = 0;  // Ditto.

    this.goIdle = (arg) => {
      this.body.velocity.y = 0;
      this.body.velocity.x = 0;
      this.anims.play('batMove', true);
    };

    this.decayVelocityY = (arg=0.5) => {  // Actor velocity decay from drag.
      if (this.destroyed) return;
      let decayRatio = arg;
      if (!this.body.blocked.down) {
        decayRatio *= 1.75;
      }
      this.body.velocity.y = parseInt(this.body.velocity.y * decayRatio);
    }

    this.wander = () => {
      if (this.changeFlightDirection) {
        this.flightDirection = Phaser.Math.FloatBetween(0, Math.PI*2);
        // Direction is 0 to 2*pi radians or 0 to 360 degrees.
        this.changeFlightDirection = false;
        let cb = () => this.changeFlightDirection = true;
        parentThis.time.delayedCall(500, cb);
      }
      if (this.x <= this.width/2 - 2) {
        // If the bat is offscreen to the left...
        this.flightDirection = 0;  // Zero radians = moving right.
      }
      else if (this.x >= config.width - this.width/2 + 2) {
        // or offscreen to the right...
        this.flightDirection = Math.PI;  // Pi radians = moving left.
      }
      this.moveInDirection(this.flightDirection);      
    };

    this.dodge = (target) => {
      // Makes the bat dodge.
      let targetVel = target.body.velocity.x;
      if (targetVel == 0) {
        if (target.x >= this.x) {
          this.dodgeDirection = Math.PI;
        }
        else {
          this.dodgeDirection = 0;
        }
      }
      else if (targetVel > 0) {
        this.dodgeDirection = Math.PI;
      }
      else {
        this.dodgeDirection = 0;
      }
      this.moveInDirection(this.dodgeDirection, 3);      
    };

    this.moveInDirection = (dir, coeff=1) => {
      // Makes the bat move in the given direction in radians.
      // coeff is for increasing the magnitude of the movement.
      let speedX = this.magnitude * Math.cos(dir);  // X component
      let speedY = -this.magnitude * Math.sin(dir);  // Y component
      this.flipX = speedX < 0;
      this.moveX(coeff * speedX, this.drag);
      this.moveY(coeff * speedY, this.drag);
      //console.log(speedX + ', ' + speedY);
    };

    this.move = (target) => {
      this.castVisionRay();
      if (this.alive) {
        if (noAI === false) {  // Ignored if noAI is true.
          this.seesPlayerRight = (
            (this.x < target.x && !this.flipX) &&
            this.lineOfSight.x2 >= target.x &&
            Math.abs(this.y - target.y) <= 64 &&
            target.alive
          );
          this.seesPlayerLeft = (
            (this.x > target.x && this.flipX) &&
            this.lineOfSight.x2 <= target.x &&
            Math.abs(this.y - target.y) <= 64 &&
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
          
          this.seesPlayer = this.seesPlayerLeft || this.seesPlayerRight;

          let inHeadStompDanger = (
            target.y > this.y - 64 &&
            target.y < this.y &&
            !target.body.blocked.down &&
            Math.abs(target.x - this.x) < 24 &&
            target.body.velocity.y > 0
          );

          if (inHeadStompDanger) {  // Dodge if about to get stomped.
            // *chuckles*
            // i'm in danger!
            this.dodge(target);
          }
          else if (this.seesPlayer) {
            // This basically uses a vector to get 
            // the correct X and Y movement speeds.
            let diffY = (-1 * (target.y - this.y));
            let diffX = target.x - this.x;
            let direction = Math.atan2(diffY, diffX);
            let dirDeg = direction;
            this.moveInDirection(direction, 1.5);
          }
          else {
            this.wander();
          }

        }
        else {
          this.goIdle();
        }
        this.anims.play('batMove', true);
      }
      else {
        if (this.body.collideWorldBounds) {
          this.setCollideWorldBounds(false);
        }
        if (this.body.height != 16) {
          this.body.setSize(8, 16);
        }
        if (this.body.gravity.y === -500) {
          this.body.setGravity(0, 500);
        }
        this.decayVelocityX(0.55);
      }
    };

  }
}

function CreateRandomBat() {
  let randomSpawn = parseInt(Math.random() * enemySpawnpoints.length);
  let x = enemySpawnpoints[randomSpawn][0];
  let y = enemySpawnpoints[randomSpawn][1];
  new Bat(parentThis, x, y);
}