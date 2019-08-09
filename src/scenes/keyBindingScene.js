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

  let saveText = 'Save Controls';
  let saveFunc = () => {
    let fileToWrite = {};
    for (let key in keyBinds) {
      fileToWrite[key] = codeKeys[keyBinds[key]];
    }
    let data = JSON.stringify(fileToWrite, null, 2);
    fs.writeFileSync('./root/dist/keybinds.json', data);
  };
  addMenuElementCenterX(saveText, saveFunc, 'saveText', centerY + 64);
  
  let returnText = 'Return';
  let returnFunc = () => {
    destroyMenuElements();
    parentThis.scene.launch('optionsMenuScene');
    parentThis.scene.stop('keyBindingScene');
  };
  addMenuElementCenterX(returnText, returnFunc, 'returnText', centerY + 80);

  let offset = 80;
  for (let i in keyBinds) {  // Makes all the menu elements for the keys.
    // keyBinds hashtable key capitalized:
    let keyStr = i[0].toUpperCase()+i.slice(1,);
    // Text shown on the menu for the given key:
    let currText = `${keyStr}: ${codeKeys[keyBinds[i]]}`;
    let currFunc = () => {  
      // Function associated with the menu element for the keybind changer.
      // Menu cursor can't be used while changing a key:
      menuCursor.canUse = false;
      changeText(keyStr + 'Text', `${keyStr}: ...`);
      let callback = (event) => {
        //console.log(event);
        let oldKeyCode = keyBinds[i];
        keyBinds[i] = event.keyCode;
        parentThis.input.keyboard.removeKey(oldKeyCode);
        cursors = parentThis.input.keyboard.addKeys(keyBinds);
        //console.log(keyBinds);
        //console.log(cursors);
        changeText(keyStr + 'Text', `${keyStr}: ${codeKeys[keyBinds[i]]}`);
        centerTextX(keyStr + 'Text');
        parentThis.input.keyboard.removeListener('keydown');
        menuCursor.canUse = true;
      };
      parentThis.input.keyboard.on('keydown', callback);
    };
    addMenuElementCenterX(currText, currFunc, keyStr+'Text', centerY - offset);
    offset -= 16;
  }


  window.menuCursor = createSceneMenuCursor();

  // This creates the scene keybinds:
  cursors = this.input.keyboard.addKeys(keyBinds);
}

function keyBindingUpdate() {
  parentThis = this;
  menuCursor.update();
}