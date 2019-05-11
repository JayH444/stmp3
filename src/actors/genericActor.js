class Actor extends Phaser.Physics.Arcade.Sprite {
  // Constructor function "class" for creating an actor 
  // and its general methods and properties.
  constructor(scene, x, y, texture, speed, name=texture, collideWB=true) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(collideWB);
    this.name = name;
    this.body.setGravity(0, 500);
    this.body.setSize(8, 16);
    this.drag = 0.25;
    this.velocityDecay = 0.5;
    this.speed = speed;
    this.alive = true;
    this.health = 3;
    this.stunned = false;
    this.invul = false;
    this.flickerTimer = 0;
    this.destroyed = false;
    // Invulnerability period after getting hit (in ms):
    this.invulPeriod = 1500;
    // Animation speed scales with actor's movement speed:
    this.animSpeed = parseInt(0.09375 * this.speed);
    parentThis.physics.add.collider(this, platforms);

    // Methods:

    this.goIdle = (arg) => {
      this.decayVelocityX(arg);
      this.anims.play(this.name + 'Idle');
    }

    this.decayVelocityX = (arg=0.5) => {  // Actor velocity decay from drag.
      if (this.destroyed) return;
      let decayRatio = arg;
      if (!this.body.blocked.down) {
        decayRatio *= 1.75;
      }
      this.body.velocity.x = parseInt(this.body.velocity.x * decayRatio);
    }

    this.moveX = (speed, inertia) => {
      if (this.destroyed) return;
      if (!this.stunned) {
        if (Math.abs(this.body.velocity.x) < Math.abs(speed)) {
          this.body.velocity.x += (speed * inertia);
        }
        else {
          this.body.velocity.x = speed;
        }
      }
    }

    this.die = () => {
      this.visible = true;
      this.alive = false;
      this.health = 0;
      this.anims.play(this.name + 'Die');
      if (this.collision) this.collision.destroy();
      parentThis.time.delayedCall(1000, () => this.destroyed = true);
      //parentThis.time.delayedCall(5000, () => this.destroy());
    }

    this.stun = (time, invulnerable=false) => {
      this.stunned = true;
      parentThis.time.delayedCall(time, () => this.stunned = false);
      if (invulnerable) {
        parentThis.time.delayedCall(50, () => this.invul = true);
        let a = [this.invulPeriod, () => this.invul = false]
        parentThis.time.delayedCall(...a);
      }
    }
  
    this.flicker = () => {
      if (this.flickerTimer == 0) {
        this.visible = !this.visible;
        this.flickerTimer = 4;
      } else {
        this.flickerTimer--;
      }
    }
  
    this.playSoundPunch = () => {
      parentThis.sound.play('punch1');
    }
  
    this.getHit = (target1, target2) => {
      // Function that executes when collision 
      // between target1 and target2 occurs.
      if (target2.body.touching.up) {
        // target1 is above target2 (headstomp)
        this.playSoundPunch();
        parentThis.physics.world.removeCollider(target1.colliders[target2.id]);
        if (target1.hasOwnProperty('addScore')) {
          target1.addScore(100);
        }
        if (target1.hasOwnProperty('addKill')) {
          target1.addKill();
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
            this.playSoundPunch();
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
  
    if (!parentThis.anims.get(this.name + 'Move')) {
      // If the animation object doesn't already 
      // contain these animations, create them.
      parentThis.anims.create({
        key: this.name + 'Move',
        frames: parentThis.anims
          .generateFrameNumbers(this.name, {start: 1, end: 2}),
        frameRate: this.animSpeed,
        repeat: -1,
        loop: true
      });
  
      parentThis.anims.create({
        key: this.name + 'Idle',
        frames: [{key: this.name, frame: 0}],
        frameRate: 10
      });
  
      parentThis.anims.create({
        key: this.name + 'Die',
        frames: [{key: this.name, frame: 5}],
        frameRate: 10
      });
  
      parentThis.anims.create({
        key: this.name + 'Jump',
        frames: [{key: this.name, frame: 1}],
        frameRate: 10
      });
  
      parentThis.anims.create({
        key: this.name + 'Punch',
        frames: [{key: this.name, frame: 4}],
        frameRate: 10
      });
    }


  }
}