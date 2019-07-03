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
  }
}