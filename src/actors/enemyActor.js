class enemyActor extends Actor {
  // Creates a acidBug.
  constructor(scene, x, y, texture, speed, animSpeed=speed) {
    let superArgs = [
      scene, x, y,
      texture,
      speed,
      texture,  // Name is the same as texture.
      animSpeed
    ];
    super(...superArgs);

    // All enemies don't collide with world bounds:
    this.setCollideWorldBounds(false);

    this.getHitByPunch = (target1, punchObject) => {
      // When a zombie gets hit, e.g. by a punch.
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
    this.punchboxArgs = [
      this, punchboxes, this.getHitByPunch, null, parentThis
    ];
    this.punchCollider = parentThis.physics.add.overlap(...this.punchboxArgs);
    
    // Player collision stuff:
    this.collisionArgs = [player, this, player.getHit, null, this]
    this.collider = parentThis.physics.add.overlap(...this.collisionArgs);
    
    // Edge detection and enemiesAlive array stuff:
    this.edgeDetectorArgs = [
      this, edgeNodes, this.changeDir, null, parentThis
    ];
    let edArgs = this.edgeDetectorArgs;
    this.edgeDetector = parentThis.physics.add.overlap(...edArgs);
    enemiesAlive.push(this);

    // Vision ray casting:
    this.castVisionRay = () => {
      if (this.alive) {
        // This controls the actor's LoS raycast.
        let flipTernary = (this.flipX) ? 0 : config.width;
        this.lineOfSight.setTo(this.x, this.y, flipTernary, this.y);
        let tilesWithinShape = map.getTilesWithinShape(this.lineOfSight);
        let i = (this.flipX) ? tilesWithinShape.length - 1 : 0;
        while ((this.flipX) ? i > -1 : i < tilesWithinShape.length) {
          // If the actor is facing left, then the tiles within the line 
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
    };
  }
}