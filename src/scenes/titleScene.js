// Title scene.

class titleScene extends Phaser.Scene {
  constructor() {
    super({key: 'titleScene', active: false});
    this.preload = titlePreload;
    this.create = titleCreate;
    this.update = titleUpdate;
  }
}

function titlePreload() {
  parentThis = this;
  // Font spritesheet. Uses ASCII values minus 32.
  /*this.load.spritesheet('fontmap', 'assets/spritesheet_font.png', 
    {frameWidth: 8, frameHeight: 8}
  );*/
}

function titleCreate() {
  parentThis = this;
  //printText('Hello World!', centerX, centerY, 'titleText');
}

function titleUpdate() {
  parentThis = this;
}