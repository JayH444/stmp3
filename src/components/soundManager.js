// Class and methods for the sound manager.
// This is mainly for preventing multiple sounds playing 
// and "overlapping" simultaneously, in order to prevent earrape.
// E.g. Punching and getting hit simultaneously, or 
// head-stomping multiple enemies simultaneously.

class soundManagerClass {
  constructor() {
    this.play = (sound) => {
      for (let i of parentThis.sound.sounds) {
        if (sound === i.key) {
          i.stop();
          i.destroy();
        }
      }
      parentThis.sound.play(sound);
    }
  }
}