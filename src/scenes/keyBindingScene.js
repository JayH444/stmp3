// Scene for binding the controls to the game.

class keyBindingScene extends Phaser.Scene {
  constructor() {
    super({key: 'keyBindingScene'});
    this.preload = keyBindingPreload;
    this.create = keyBindingCreate;
    this.update = keyBindingUpdate;
  }
}

function keyBindingPreload() {
  parentThis = this;
}

function keyBindingCreate() {
  parentThis = this;

  let keyBindIDs = Object.keys(keyBinds);

  let offset = 80;
  for (let i of keyBindIDs) {  // Makes all the menu buttons for the keys.
    // keyBinds hashtable key capitalized:
    let keyStr = i[0].toUpperCase()+i.slice(1,);
    let currID = i+'Button'
    // Text shown on the menu for the given key:
    let currText = `${keyStr}: ${codeKeys[keyBinds[i]]}`;
    let currFunc = () => {  
      // Function associated with the menu button for the keybind changer.
      // Menu cursor can't be used while changing a key:
      menuCursor.canUse = false;
      changeText(currID, `${keyStr}: ...`);
      let callback = (event) => {
        let oldKeyCode = keyBinds[i];
        keyBinds[i] = event.keyCode;
        parentThis.input.keyboard.removeKey(oldKeyCode);
        cursors = parentThis.input.keyboard.addKeys(keyBinds);
        changeText(currID, `${keyStr}: ${codeKeys[keyBinds[i]]}`);
        centerTextX(currID);
        parentThis.input.keyboard.removeListener('keydown');
        menuCursor.canUse = true;
      };
      parentThis.input.keyboard.on('keydown', callback);
    };
    createMenuButtonCenterX(currID, currText, currFunc, centerY - offset);
    offset -= 16;
  }

  let topBindButtonID = keyBindIDs[0]+'Button';
  let bottomBindButtonID = keyBindIDs[keyBindIDs.length-1]+'Button';

  // Code for creating the save and return button, and connecting them to
  // the top and bottom keybind button. (topBindButtonID & bottomBindButtonID)
  let saveFunc = () => {
    let fileToWrite = {};
    for (let key in keyBinds) {
      fileToWrite[key] = codeKeys[keyBinds[key]];
    }
    let data = JSON.stringify(fileToWrite, null, 2);
    fs.writeFileSync('./root/dist/keybinds.json', data);
  };
  let saveButtonArgs = [
    'saveButton', 'Save Controls', saveFunc, centerY + 64,
    createMenuButtonCons(bottomBindButtonID, 'returnButton')
  ];
  createMenuButtonCenterX(...saveButtonArgs)
  
  let returnFunc = () => {
    destroyMenuButtons();
    parentThis.scene.launch('optionsMenuScene');
    parentThis.scene.stop('keyBindingScene');
  };
  let returnButtonArgs = [
    'returnButton', 'Return', returnFunc, centerY + 80,
    createMenuButtonCons('saveButton', keyBindIDs[0]+'Button')
  ];
  createMenuButtonCenterX(...returnButtonArgs);

  addConsToMenuButton(topBindButtonID, true, 'returnButton');
  addConsToMenuButton(bottomBindButtonID, true, undefined, 'saveButton');

  // For loop for iterating over the bind buttons between first & last, and
  // creating their corresponding button input connections:
  let lastID;
  for (let i = 0; i < keyBindIDs.length; i++) {
    let currID = keyBindIDs[i]+'Button';
    let nextID = undefined;
    if (menuButtons[currID].up != undefined) {
      lastID = undefined;
    }
    if (menuButtons[currID].down == undefined) {
      nextID = keyBindIDs[i+1]+'Button';
    }
    addConsToMenuButton(currID, false, lastID, nextID);
    lastID = currID;
  }

  window.menuCursor = createSceneMenuCursor('returnButton');

  // This creates the scene keybinds:
  cursors = this.input.keyboard.addKeys(keyBinds);
}

function keyBindingUpdate() {
  parentThis = this;
  menuCursor.update();
}