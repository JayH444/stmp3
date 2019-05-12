// Title scene.

class titleScene extends Phaser.Scene {
  constructor() {
    super({key: 'titleScene', active: true});
    this.preload = titlePreload;
    this.create = titleCreate;
    this.update = titleUpdate;
  }
}

function titlePreload() {  // Loads game assets.

  //Images and sound effects:
  let fs = require('fs');
  let files = fs.readdirSync('../dev/root/dist/assets');
  for (let file of files) {
    // Loop for loading the images in the assets directory.
    // Automatically names them.
    // !!!Ignores files with a 'spritesheet_' prefix!!!
    // Spritesheets need to be loaded manually.
    let pattern = /(\w+)\.png/;
    this.load.image(file.match(pattern)[1], 'assets/' + file);
  }

  // Font spritesheet. Uses ASCII values minus 32.
  this.load.spritesheet('fontmap', 'assets/spritesheet_font.png', 
    {frameWidth: 8, frameHeight: 8}
  );
  // Player spritesheet:
  this.load.spritesheet('player', 'assets/spritesheet_dude.png', 
    {frameWidth: 16, frameHeight: 16}
  );
  // Zombie spritesheet:
  this.load.spritesheet('zombie', 'assets/spritesheet_zombie.png',
    {frameWidth: 16, frameHeight: 16}
  );

  // Sound effect loader:
  files = fs.readdirSync('../dev/root/dist/sfx');
  for (let file of files) {
    // Loop for loading the sounds in the sfx directory.
    // Automatically names them.
    // Uses \w+ just in case there's any weird sound file extensions:
    let pattern = /(\w+)\.\w+/;
    this.load.audio(file.match(pattern)[1], 'sfx/' + file);
  }
  
  this.load.image('menuCursor', 'assets/menu_cursor.png');
  this.load.image('gameLogo', 'assets/game_logo.png');
}

function titleCreate() {
  parentThis = this;

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
      parentThis.scene.launch('levelIntroScene');
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