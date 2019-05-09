class Player extends Actor {
  // Creates a this.
  constructor(scene, x, y, texture, speed, name=texture) {
    super(scene, x, y, texture, speed, name, true);
    this.score = 0;
    this.getScore = () => this.score.toString().padStart(7, '0');
    this.addScore = (points) => {
      this.score += points;
      updateText('playerScore', this.getScore);
    };
    this.kills = 0;
    this.getKills = () => this.kills.toString().padStart(3, '0');
    this.addKill = () => {
      this.kills++;
      gameEnemyManager.decrement();
    }
    this.holdingJump = false;
    this.holdingPunch = false;
    this.isPunching = false;
    this.punchAnimPlay = false;
    this.punchCoolingDown = false;
    this.hb = [];  // Array for pointers to the health bar images.
    // Player health bar:
    for (let i = 0; i < this.health; i++) {
      let pos = config.width - 8 - (i * 12);
      this.hb.unshift(parentThis.add.image(pos, 8, 'heart'));
    }
  
    this.addHealth = () => {
      if (this.health < 3) {
        this.health++;
        this.hb[3 - this.health].setVisible(true);
      }
      else {
        this.addScore(1000);
      }
    }
  
    this.punch = () => {
      this.playSoundPunch();
      this.anims.play('playerPunch');
      this.isPunching = true;
      this.punchAnimPlay = true;
      this.punchCoolingDown = true;
      parentThis.time.delayedCall(100, () => this.punchAnimPlay = false);
      parentThis.time.delayedCall(200, () => this.punchCoolingDown = false);
      let CollisionX = (this.flipX) ? this.x - 10 : this.x + 10;
      let punchbox = punchboxes.create(CollisionX, this.y, 'punchbox');
      parentThis.time.delayedCall(100, () => punchbox.destroy());
    }

    this.update = () => {
      // Player input and animations conditionals:
      const onGround = this.body.blocked.down;

      if (this.alive) {
        if (!(cursors.left.isDown && cursors.right.isDown)) {
          if (cursors.left.isDown) {
            this.moveX(-this.speed, this.drag);
            this.flipX = true;
            this.anims.play('playerMove', true);
          }
          else if (cursors.right.isDown) {
            this.moveX(this.speed, this.drag);
            this.flipX = false;
            this.anims.play('playerMove', true);
          }
          else {
            this.goIdle();
          }
        }
        else {
          this.goIdle();
        }

        if (!onGround) {
          this.anims.play('playerJump');
        }

        if (cursors.a.isDown) {
          if (!this.isPunching) {
            this.punch();
          }
        }
        else if (cursors.a.isUp && !this.punchCoolingDown) {
          this.isPunching = false;
        }
        if (this.punchAnimPlay) {
          this.anims.play('playerPunch');
        }

        if (cursors.b.isDown && onGround && !this.holdingJump) {
          this.setVelocityY(-300);
          parentThis.sound.play('jump');
          this.holdingJump = true;
        }
        else if (cursors.b.isUp) {
          this.holdingJump = false;
        }

        if (this.invul) {
          this.flicker();
        } else {
          this.visible = true;
        }
      }
      else {
        this.decayVelocityX(0.55);
      }
    }
  }
}