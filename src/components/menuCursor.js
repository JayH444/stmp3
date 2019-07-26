// Class and methods for the menu cursor.

class menuCursorClass extends Phaser.GameObjects.Image {
  constructor(scene, x, y, texture, menuElems, frame) {
    super(scene, x, y, texture, frame);
    this.position = 0;
    this.canUse = true;
    this.update = () => {  // Updates the cursor position upon input.
      if (this.canUse) {
        let lastPos = this.position;
        if (Phaser.Input.Keyboard.JustDown(cursors.down)) {
          if (this.position + 1 < menuElems.length) {
            this.position++;
          }
          else {
            this.position = 0;
          }
        }
        else if (Phaser.Input.Keyboard.JustDown(cursors.up)) {
          if (this.position - 1 > -1) {
            this.position--
          }
          else {
            this.position = menuElems.length - 1;
          }
        }
        if (lastPos != this.position) {
          this.y = menuElems[this.position][0];
          this.x = textObjects[menuElems[this.position][1]][0].x-10;
        }
        let startDown = Phaser.Input.Keyboard.JustDown(cursors.start);
        let aDown = Phaser.Input.Keyboard.JustDown(cursors.a);
        if (startDown || aDown) {
          menuElems[this.position][2]();
        }
      }
    };
    scene.add.existing(this);
  }
}