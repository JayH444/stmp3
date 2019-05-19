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
        up: Phaser.Input.Keyboard.KeyCodes.W,
        down: Phaser.Input.Keyboard.KeyCodes.S,
        left: Phaser.Input.Keyboard.KeyCodes.A,
        right: Phaser.Input.Keyboard.KeyCodes.D,
        b: Phaser.Input.Keyboard.KeyCodes.SPACE,
        a: Phaser.Input.Keyboard.KeyCodes.CTRL,
        p: Phaser.Input.Keyboard.KeyCodes.P
      });
    }
    this.update = function() {
      let curP = cursorsPaused;
      if (curP.a.isDown && curP.b.isDown && curP.down.isDown) {
        parentThis.scene.launch('titleScene');
        parentThis.scene.stop('mainScene');
        parentThis.scene.stop('pausedScene');
        totalScore = 0;
        resetGlobalVars()
      }
      if (Phaser.Input.Keyboard.JustDown(curP.p) && paused) {
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