class Bat extends Actor {
  constructor(scene, x, y) {
    let superArgs = [
      scene, x, y,
      'bat',
      60 * (1 + (Math.random() - 0.5) / 7),  // Movement speed randomizer.
      'bat',  // Name is the same as texture.
      false,  // Doesn't collide with world bounds.
    ];
    super(...superArgs);
    
  }
}

// Like the zombie, the bat is going to need some kind of ID system.
// It would be best to make that some kind of part of the general enemy actor class.