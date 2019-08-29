// Name entering scene.

class nameEnteringScene extends Phaser.Scene {
  constructor() {
    super({key: 'nameEnteringScene'});
    this.preload = nameEnteringPreload;
    this.create = nameEnteringCreate;
    this.update = nameEnteringUpdate;
  }
}

function nameEnteringPreload() {
  parentThis = this;
}

function nameEnteringCreate() {
  parentThis = this;

  let letterFunc = (L) => {
    if (enteredName.length < 5) {
      enteredName += L;
      let displayed = enteredName;
      changeText('enteredName', displayed.padEnd(5, '_'));
    }
  };
  let kb = [
    'abcdef',
    'ghijkl',
    'mnopqr',
    'stuvwx',
    'yz0123',
    '456789'
  ];
  let offsetY = 72;
  for (let row of kb) {
    let offsetX = 110;
    for (let L of row) {
      let LU = L.toUpperCase();
      createMenuButton(L+'Button', LU, () => letterFunc(LU), offsetX, offsetY);
      offsetX += 20;
    }
    offsetY += 16;
  }
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 6; j++) {
      let currCons = [...Array(4)];
      
      // Conditional statements for the button connections:

      // Up
      if (i == 0) {
        // If on the first row, connect to the return button for moving up.
        currCons[0] = 'returnButton';
      }
      else {
        currCons[0] = kb[i-1][j]+'Button';
      }

      // Down
      if (i == 5) {
        // If on the last row, connect to the clear
        // and submit buttons below for moving down.
        currCons[1] = (j < 3) ? 'submitButton' : 'eraseButton';
      }
      else {
        currCons[1] = kb[i+1][j]+'Button';
      }

      // Left
      if (j == 0) {
        currCons[2] = kb[i][5]+'Button';
      }
      else {
        currCons[2] = kb[i][j-1]+'Button';
      }

      // Right
      if (j == 5) {
        currCons[3] = kb[i][0]+'Button';
      }
      else {
        currCons[3] = kb[i][j+1]+'Button';
      }

      addConsToMenuButton(kb[i][j]+'Button', true, ...currCons);
    }
  }

  //let returnFunc = makeSceneLaunchCallback('titleScene', 'nameEnteringScene');
  //addMenuElementCenterX('Return', returnFunc, 'returnScoreText', centerY + 72);

  printTextCenter('Enter a name:', 'nameEnteringTitle', 16);
  
  printTextCenter(enteredName.padEnd(5, '_'), 'enteredName', 48);

  let eraseButtonFunc = () => {
    enteredName = enteredName.slice(0, enteredName.length-1);
    let displayed = enteredName;
    changeText('enteredName', displayed.padEnd(5, '_'));
  }
  createMenuButtonOffsetCenterX('eraseButton', 'Erase', eraseButtonFunc, 32, centerY + 56, createMenuButtonCons('8Button', 'returnButton', 'submitButton', 'submitButton'));

  /*let saveScoreFunc = () => {
    let name = 'TESTA';
    scores[name] = totalScore;
    let data = JSON.stringify(scores, null, 2);
    fs.writeFileSync('./root/dist/scores.json', data);
    totalScore = 0;
  }*/

  let submitButtonFunc = () => {
    console.log(totalScore);
    if (enteredName.length == 5) {
      if (scores.hasOwnProperty(enteredName)) {
        scores[enteredName] = totalScore;
      }
      else {
        let minScoreName = null;
        for (let name in scores) {
          if (minScoreName == null || scores[name] < scores[minScoreName]) {
            minScoreName = name;
          }
        }
        console.log(`Replacing ${minScoreName}...`);
        delete scores[minScoreName];
        scores[enteredName] = totalScore;
        let data = JSON.stringify(scores, null, 2);
        fs.writeFileSync('./root/dist/scores.json', data);
      }
      totalScore = 0;
    }
    makeSceneLaunchCallback('scoreSubmittedScene', 'nameEnteringScene')();
  }
  createMenuButtonOffsetCenterX('submitButton', 'Submit', submitButtonFunc, -32, centerY + 56, createMenuButtonCons('5Button', 'returnButton', 'eraseButton', 'eraseButton'));

  createReturnButtonCenterX('titleScene', 'nameEnteringScene', centerY + 72, createMenuButtonCons('submitButton', 'aButton'));
  changeMenuButtonText('returnButton', 'Cancel & Return');
  centerMenuButtonTextX('returnButton');

  window.menuCursor = createSceneMenuCursor('returnButton');

  // This creates the scene keybinds:
  cursors = this.input.keyboard.addKeys(keyBinds);
}

function nameEnteringUpdate() {
  parentThis = this;
  menuCursor.update();
}