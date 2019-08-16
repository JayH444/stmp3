// Loading screen scene.

class loadingScene extends Phaser.Scene {
  constructor() {
    super({key: 'loadingScene', active: true});
    this.preload = loadingPreload;
    this.create = loadingCreate;
    this.update = loadingUpdate;
  }
}

function setRect(rect, style, coords) {
  rect.clear();
  rect.fillStyle(...style);
  rect.fillRect(...coords);
}

function loadingPreload() {  // Loads game assets.
  parentThis = this;
  
  window.progressBox = this.add.graphics();
  window.progressBar = this.add.graphics();

  progressBox.fillStyle(0xbe2633, 1);
  progressBox.fillRect(centerX-50, centerY-10, 100, 20);

  this.load.on('progress', (value) => {
    // Increases the loading bar size as more assets are loaded.
    progressBar.clear();
    progressBar.fillStyle(0xffffff, 1);
    progressBar.fillRect(centerX-50, centerY-10, 100*value, 20);
  });

  window.loadingComplete = false;

  this.load.on('complete', () => {
    progressBox.destroy();
    progressBox = undefined;
    loadingComplete = true;
  });

  //Images and sound effects:
  window.fs = require('fs');  // File system module.

  let files = fs.readdirSync('./root/dist/assets');
  for (let file of files) {
    // Loop for loading the images in the assets directory.
    // Automatically names them.
    // !!!Ignores files with a 'spritesheet_' prefix!!!
    // Spritesheets need to be loaded separately.
    if (!/spritesheet/.test(file)) {
      let pattern = /(\w+)\.png/;
      this.load.image(file.match(pattern)[1], 'assets/' + file);
    }
  }

  // Font spritesheet. Uses ASCII values minus 32.
  this.load.spritesheet('fontmap', 'assets/spritesheet_font.png', 
    {frameWidth: 8, frameHeight: 8}
  );

  // Loads and automatically names the spritesheets
  for (let file of files) {
    if (/spritesheet/.test(file) && !/font/.test(file)) {
      console.log(file);
      let pattern = /spritesheet_(\w+)/;
      this.load.spritesheet(file.match(pattern)[1], 'assets/' + file,
        {frameWidth: 16, frameHeight: 16}
      );
    }
  }

  // Sound effect loader:
  files = fs.readdirSync('./root/dist/sfx');
  for (let file of files) {
    // Loop for loading the sounds in the sfx directory.
    // Automatically names them.
    // Uses \w+ just in case there's any weird sound file extensions:
    let pattern = /(\w+)\.\w+/;
    this.load.audio(file.match(pattern)[1], 'sfx/' + file);
  }

  // Level JSON loading:
  window.levels = loadLevelTilesheets();

  // Misc image loading:
  this.load.image('menuCursor', 'assets/menu_cursor.png');
  this.load.image('gameLogo', 'assets/game_logo.png');
  this.load.image('tiles', 'assets/game_tiles.png');

  // Keybinds loading from JSON file:
  window.kbDir = './root/dist/keybinds.json';
  window.keyBinds = JSON.parse(fs.readFileSync(kbDir));
  for (let key in keyBinds) {
    keyBinds[key] = Phaser.Input.Keyboard.KeyCodes[keyBinds[key]];
  }

  // Scores loading from JSON file:
  window.scoresDir = './root/dist/scores.json';
  window.scores = JSON.parse(fs.readFileSync(scoresDir));
}

function loadingCreate() {
}

function loadingUpdate() {
  parentThis = this;

  if (loadingComplete) {
    // When the asset loading is complete, fade the loading bar out and
    // launch the title OR launch the main scene if skipTitle is true.
    let colors = [0xb2dcef, 0x31a2f2, 0x005784, 0x1b2632, 0x000000];
    for (let i = 0; i < colors.length; i++) {
      let timeoutArg = () => {
        setRect(progressBar, [colors[i], 1], [centerX-50, centerY-10, 100, 20])
      }; 
      setTimeout(timeoutArg, 33*(i+1));
    }
    let launchTitle = () => {
      if (!skipTitle) {
        parentThis.scene.launch('titleScene');
      }
      else {
        parentThis.scene.launch('mainScene');
      }
      parentThis.scene.stop('loadingScene');
    }
    setTimeout(launchTitle, 300);
    loadingComplete = false;
  };
}