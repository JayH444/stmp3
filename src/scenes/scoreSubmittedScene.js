// Score submitted scene.

class scoreSubmittedScene extends Phaser.Scene {
    constructor() {
      super({key: 'scoreSubmittedScene'});
      this.preload = scoreSubmittedPreload;
      this.create = scoreSubmittedCreate;
      this.update = scoreSubmittedUpdate;
    }
  }
  
  function scoreSubmittedPreload() {
    parentThis = this;
  }
  
  function scoreSubmittedCreate() {
    parentThis = this;
    printTextCenter('Score submitted!', 'scoreSubmittedText');
    setTimeout(() => {
      parentThis.scene.launch('titleScene');
      parentThis.scene.stop('scoreSubmittedScene');    
    }, 1500);
  }
  
  function scoreSubmittedUpdate() {
    parentThis = this;
  }