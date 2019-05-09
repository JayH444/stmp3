// Math-related functions.

function calculateDistance(target1x, target1y, target2x, target2y) {
  // Calculates the absolute distance between two targets.
  let deltaXSquared = Math.pow(Math.abs(target1x - target2x), 2);
  let deltaYSquared = Math.pow(Math.abs(target1y - target2y), 2);
  return Math.round(Math.sqrt(deltaXSquared + deltaYSquared));
}

function pickRandomSprite(arr) {
  return Phaser.Math.RND.pick(arr);
}