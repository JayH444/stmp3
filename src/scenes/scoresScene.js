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

  console.log(scores);

  let offset = -48;
  let scoresSorted = [...Object.keys(scores)].sort((a, b) => scores[b] - scores[a]);
  console.log(scoresSorted);
  for (let score of scoresSorted) {
    let entry = `${score}: ${scores[score].toString().padStart(12, '-')}`
    printTextCenter(entry, score+'playerScore', centerY + offset);
    offset += 12;
  }

  let returnFunc = makeSceneLaunchCallback('titleScene', 'scoresScene');
  let deleteReturn = () => {
    returnFunc();
  };
  addMenuElementCenterX('Return', returnFunc, 'returnScoreText', centerY + 72);

  window.menuCursor = createSceneMenuCursor();

  // This creates the scene keybinds:
  cursors = this.input.keyboard.addKeys(keyBinds);
}

function scoresUpdate() {
  parentThis = this;
  menuCursor.update();
}