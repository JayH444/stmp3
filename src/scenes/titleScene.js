// Title scene.

class titleScene extends Phaser.Scene {
  constructor() {
    super({key: 'titleScene'});
    this.preload = titlePreload;
    this.create = titleCreate;
    this.update = titleUpdate;
  }
}

function titlePreload() {
}

function titleCreate() {
  parentThis = this;

  let gameTitle = this.add.image(centerX, centerY-60, 'gameLogo');
  let signature = this.add.image(config.width-16, config.height-7, 'signature');
  
  window.validMenuPositions = [];

  function addMenuOption(str, id, x, y) {
    // Adds a menu option to the valid menu positions array.
    validMenuPositions.push([y, id]);
    printText(str, x, y, id);
  }

  function addMenuOptionCenterX(str, id, y) {
    // Adds a centered menu option to the valid menu positions array.
    validMenuPositions.push([y, id]);
    printTextCenter(str, id, y);
  }

  let playText = 'Play';
  let optionText = 'Options';
  let quitText = 'Quit';
  addMenuOptionCenterX(playText, 'playText', centerY - 4);
  addMenuOptionCenterX(optionText, 'optionsText', centerY + 12);
  addMenuOptionCenterX(quitText, 'quitText', centerY + 28);

  let menuCursorArgs = [
    textObjects['playText'][0].x-10, textObjects['playText'][0].y, 'menuCursor'
  ];
  window.menuCursor = this.add.image(...menuCursorArgs);
  menuCursor.position = 0;

  window.menuFunctions = {
    playText: () => {
      parentThis.scene.launch('levelIntroScene');
      parentThis.scene.stop('titleScene');
    },
    optionsText: () => {
      parentThis.scene.launch('optionsMenuScene');
      parentThis.scene.stop('titleScene');
    },
    quitText: () => {
      nw.App.quit();
    },
  };

  // This creates the keybinds:
  cursors = this.input.keyboard.addKeys({
    up: Phaser.Input.Keyboard.KeyCodes.W,
    down: Phaser.Input.Keyboard.KeyCodes.S,
    left: Phaser.Input.Keyboard.KeyCodes.A,
    right: Phaser.Input.Keyboard.KeyCodes.D,
    b: Phaser.Input.Keyboard.KeyCodes.SPACE,
    a: Phaser.Input.Keyboard.KeyCodes.CTRL,
    p: Phaser.Input.Keyboard.KeyCodes.P,
    start: Phaser.Input.Keyboard.KeyCodes.ENTER,
  });
}

function titleUpdate() {
  parentThis = this;
  if (Phaser.Input.Keyboard.JustDown(cursors.down)) {
    if (menuCursor.position + 1 < validMenuPositions.length) {
      menuCursor.position++;
      menuCursor.y = validMenuPositions[menuCursor.position][0];
      menuCursor.x = textObjects[validMenuPositions[menuCursor.position][1]][0].x-10;
    }
  }
  else if (Phaser.Input.Keyboard.JustDown(cursors.up)) {
    if (menuCursor.position - 1 > -1) {
      menuCursor.position--
      menuCursor.y = validMenuPositions[menuCursor.position][0];
      menuCursor.x = textObjects[validMenuPositions[menuCursor.position][1]][0].x-10;
    }
  }
  if (Phaser.Input.Keyboard.JustDown(cursors.start) || Phaser.Input.Keyboard.JustDown(cursors.a)) {
    let currKey = validMenuPositions[menuCursor.position][1];
    if (menuFunctions.hasOwnProperty(currKey)) {
      menuFunctions[currKey]();
    }
  }
}