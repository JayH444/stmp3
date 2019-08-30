// Scores scene.

class scoresScene extends Phaser.Scene {
  constructor() {
    super({key: 'scoresScene'});
    this.preload = scoresPreload;
    this.create = scoresCreate;
    this.update = scoresUpdate;
  }
}

function scoresPreload() {
  parentThis = this;
}

function scoresCreate() {
  parentThis = this;

  let offset = -56;
  let scoresKeys = [...Object.keys(scores)]
  let scoresKeysSorted = scoresKeys.sort((a, b) => scores[b] - scores[a]);
  for (let score of scoresKeysSorted) {
    let entry = `${score}: ${scores[score].toString().padStart(12, '-')}`
    printTextCenter(entry, score+'playerScore', centerY + offset);
    offset += 12;
  }

  let returnFunc = makeSceneLaunchCallback('titleScene', 'scoresScene');
  createMenuButtonCenterX('returnButton', 'Return', returnFunc, centerY+72);

  window.menuCursor = createSceneMenuCursor('returnButton');

  // This creates the scene keybinds:
  cursors = this.input.keyboard.addKeys(keyBinds);
}

function scoresUpdate() {
  parentThis = this;
  menuCursor.update();
}