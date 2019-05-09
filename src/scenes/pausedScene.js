// Scene for when the game is paused.

class pausedScene extends Phaser.Scene {
  constructor() {
    super({key:'pausedScene'});
    this.preload = function() {
    };
    this.create = function() {
      printText('PAUSED', centerX-20, centerY, 'pauseText');
      // This creates the keybinds:
      cursorsPaused = this.input.keyboard.addKeys({
        p: Phaser.Input.Keyboard.KeyCodes.P
      });
    }
    this.update = function() {
      if (Phaser.Input.Keyboard.JustDown(cursorsPaused.p) && paused) {
        destroyText('pauseText');
        paused = false;
        cursors.up.isDown = false;
        cursors.down.isDown = false;
        cursors.left.isDown = false;
        cursors.right.isDown = false;
        cursors.a.isDown = false;
        cursors.b.isDown = false;
        cursors.p.isDown = false;
        this.scene.resume('mainScene');
        this.scene.pause('pausedScene');
      }
    }
  }
}