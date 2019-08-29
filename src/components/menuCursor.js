// Class and methods for the menu cursor.

class menuCursorClass extends Phaser.GameObjects.Image {
  constructor(scene, x, y, texture, startingButtonId, frame) {
    super(scene, x, y, texture, frame);
    this.buttonSelected = startingButtonId;
    // buttonSelected will be the ID of the menu button it is currently on.
    // This ID is also equivalent to the textobject ID of the text 
    // associated with the button.
    this.canUse = true;
    let directions = ['up', 'down', 'left', 'right'];
    this.update = () => {
      if (this.canUse) {
        let lastButtonXCoord = textObjects[this.buttonSelected][0].x - 10;
        if (lastButtonXCoord != this.x) {
          this.x = lastButtonXCoord;
        }
        // lastButtonXCoord is for when the text of the currently selected
        // button changes. If the X coordinate of the leftmost letter minus 10
        // (cursor offset) does not equal the current cursor coord, then
        // it will update it.
        for (let dir of directions) {
          if (Phaser.Input.Keyboard.JustDown(cursors[dir])) {
            if (Boolean(menuButtons[this.buttonSelected][dir])) {
              this.buttonSelected = menuButtons[this.buttonSelected][dir];
              //console.log('The current button selected is:');
              //console.log(menuButtons[this.buttonSelected]);
              this.x = menuButtons[this.buttonSelected].x - 10;
              this.y = menuButtons[this.buttonSelected].y;
            }
          }
        }
        let startDown = Phaser.Input.Keyboard.JustDown(cursors.start);
        let aDown = Phaser.Input.Keyboard.JustDown(cursors.a);
        if (startDown || aDown) {
          menuButtons[this.buttonSelected].func();
        }
      }
    };
    scene.add.existing(this);
  }
}