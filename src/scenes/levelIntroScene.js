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
  currentLevel = (pickRandomLevel) ? randomLevel() : levels[levelNumber];
}

function levelIntroCreate() {
  parentThis = this;
  let tilemapEntries = parentThis.cache.tilemap.entries.entries;
  let mapNameProperty = tilemapEntries[currentLevel].data.properties[0];
  let levelName = (mapNameProperty) ? mapNameProperty.value : currentLevel;
  printTextCenter(levelName, 'levelIntroText');
  setTimeout(() => {
    parentThis.scene.launch('mainScene');
    parentThis.scene.stop('levelIntroScene');    
  }, 1500);
}

function levelIntroUpdate() {
  parentThis = this;
}