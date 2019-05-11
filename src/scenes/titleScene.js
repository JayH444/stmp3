// Title scene.

class titleScene extends Phaser.Scene {
  constructor() {
    super({key: 'titleScene', active: true});
    this.preload = titlePreload;
    this.create = titleCreate;
    this.update = titleUpdate;
  }
}

function titlePreload() {
  parentThis = this;
  // Font spritesheet. Uses ASCII values minus 32.
  this.load.spritesheet('fontmap', 'assets/spritesheet_font.png', 
    {frameWidth: 8, frameHeight: 8}
  );
  this.load.image('menuCursor', 'assets/menu_cursor.png');
  this.load.image('gameLogo', 'assets/game_logo.png');
}

function titleCreate() {
  parentThis = this;
  //let titleText = 'Super Turbo Monster Puncher 3';
  //let titleX = centerX-(titleText.length*8/2);
  //printText(titleText, titleX, centerY-64, 'titleText');

  let gameTitle = this.add.image(centerX, centerY-60, 'gameLogo');
  
  window.validMenuPositions = [];

  function addMenuOption(str, x, y, id) {
    validMenuPositions.push([y, id]);
    printText(str, x, y, id);
  }

  let playText = 'Play';
  let quitText = 'Quit';
  addMenuOption(playText, centerX-(playText.length*8/2), centerY, 'playText');
  addMenuOption(quitText, centerX-(quitText.length*8/2), centerY+16, 'quitText');

  let menuCursorArgs = [
    textObjects['playText'][0].x-10, textObjects['playText'][0].y, 'menuCursor'
  ];
  window.menuCursor = this.add.image(...menuCursorArgs);
  menuCursor.position = 0;

  window.menuFunctions = {
    playText: () => {
      parentThis.scene.launch('mainScene');
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
    }
  }
  else if (Phaser.Input.Keyboard.JustDown(cursors.up)) {
    if (menuCursor.position - 1 > -1) {
      menuCursor.position--
      menuCursor.y = validMenuPositions[menuCursor.position][0];
    }
  }
  if (Phaser.Input.Keyboard.JustDown(cursors.start) || Phaser.Input.Keyboard.JustDown(cursors.a)) {
    let currKey = validMenuPositions[menuCursor.position][1];
    if (menuFunctions.hasOwnProperty(currKey)) {
      menuFunctions[currKey]();
    }
  }
}