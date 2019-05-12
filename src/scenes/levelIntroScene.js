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
  printText('Level 1', centerX-(7*8/2)+4, centerY, 'levelIntroText');
  setTimeout(() => {
    parentThis.scene.launch('mainScene');
    parentThis.scene.stop('levelIntroScene');    
  }, 1500);
}

function levelIntroUpdate() {
  parentThis = this;
}