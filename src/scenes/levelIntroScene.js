// Level intro scene.

class levelIntroScene extends Phaser.Scene {
  constructor() {
    super({key: 'levelIntroScene'});
    this.preload = levelIntroPreload;
    this.create = levelIntroCreate;
    this.update = levelIntroUpdate;
  }
}

function levelIntroPreload() {
  parentThis = this;
}

function levelIntroCreate() {
  parentThis = this;
  printTextCenter('Level 1', 'levelIntroText');
  setTimeout(() => {
    parentThis.scene.launch('mainScene');
    parentThis.scene.stop('levelIntroScene');    
  }, 1500);
}

function levelIntroUpdate() {
  parentThis = this;
}