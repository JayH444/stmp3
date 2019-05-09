// Array for storing the pickupables:
let pickupables = [];
// Used when generating overlap colliders.

function mixinPickupableMethods(p, sprite, destructTime) {
  // Mixin for generic pickupable methods.

  p.pickup = (player, child) => {
    player.addScore(250);
    parentThis.sound.play('pickup');
    p.remove(child, true, true);
  }

  p.spawn = (posX, posY) => {
    p.create(posX, posY, sprite);
    let lastInst = p.children.entries[p.children.entries.length-1];
    lastInst.setDepth(1);
    let destroy = () => {
      p.remove(lastInst, true, true);
    }
    parentThis.time.delayedCall(destructTime, destroy);
  }
  
  p.spawnRandom = () => {
    // Selects a random position from the valid spawn areas:
    let position = pickRandomSprite(ValidItemSpawnAreas);
    let distArgs = [position[0], position[1], player.x, player.y];
    // Prevents items from spawning on the player:
    while (calculateDistance(...distArgs) < 32) {
      position = pickRandomSprite(ValidItemSpawnAreas);
      distArgs = [position[0], position[1], player.x, player.y];
    }
    p.spawn(...position);
  }

  pickupables.push(p);

}