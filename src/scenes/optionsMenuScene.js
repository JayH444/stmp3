// Options menu scene.

class optionsMenuScene extends Phaser.Scene {
  constructor() {
    super({key: 'optionsMenuScene'});
    this.preload = optionsMenuPreload;
    this.create = optionsMenuCreate;
    this.update = optionsMenuUpdate;
  }
}

function optionsMenuPreload() {
  parentThis = this;
}

function optionsMenuCreate() {
  parentThis = this;
  printTextCenter('Hello!', 'thingie');
  setTimeout(() => {
    parentThis.scene.launch('titleScene');
    parentThis.scene.stop('optionsMenuScene');    
  }, 3000);
}

function optionsMenuUpdate() {
  parentThis = this;
}