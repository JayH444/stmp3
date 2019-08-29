/*function addMenuElementCenterX(str, func, id, y) {
  // Adds a centered menu option to the valid menu positions array.
  menuElements.push([y, id, func]);
  printTextCenter(str, id, y);
}*/

function addMenuButtonObject(buttonObj) {
  // A button object has the following properties:
  // id, text, func, x, y, and its connections for a given key press.
  // (e.g. up)
  menuButtons[buttonObj.id] = buttonObj;
  printText(buttonObj.text, buttonObj.x, buttonObj.y, buttonObj.id);
}

function createMenuButton(id, text, func, x, y, connections) {
  // Shorthand function for quickly creating a menu button.
  let mbObject = {
    id: id,
    text: text,
    func: func,
    x: x,
    y: y,
  };
  for (let c in connections) {
    mbObject[c] = connections[c];
  }
  addMenuButtonObject(mbObject);
}

function createMenuButtonCenterX(id, text, func, y, connections) {
  let x = centerX - (text.length*8/2) + 4;
  createMenuButton(id, text, func, x, y, connections);
}

function createMenuButtonOffsetCenterX(id, text, func, xOffset, y, connections) {
  let x = (centerX - (text.length*8/2) + 4) + xOffset;
  createMenuButton(id, text, func, x, y, connections);
}

function createMenuButtonCons(up, down, left, right) {
  return {up: up, down: down, left: left, right: right};
}

function addConsToMenuButton(id, override=true, up, down, left, right) {
  let newCons = {up: up, down: down, left: left, right: right};
  for (let c in newCons) {
    if ((!override && menuButtons[id][c] == undefined) || override) {
      menuButtons[id][c] = newCons[c];
    }
  }
}

function changeMenuButtonText(id, newText) {
  menuButtons[id].text = newText;
  changeText(id, newText);
}

function centerMenuButtonTextX(id) {
  centerTextX(id);
  menuButtons[id].x = textObjects[id][0].x;
}

function destroyMenuButtons() {
  // Destroys the contents of the menuButtons object.
  // todo...
  for (let i in menuButtons) {
    destroyText(menuButtons[i].id);
    delete menuButtons[i];
  }
}

function createReturnButton(newSceneName, oldSceneName, x, y, cons) {
  let returnFunc = makeSceneLaunchCallback(newSceneName, oldSceneName);
  createMenuButton('returnButton', 'Return', returnFunc, x, y, cons)
}

function createReturnButtonCenterX(newSceneName, oldSceneName, y, cons) {
  createReturnButton(newSceneName, oldSceneName, centerX - (24) + 4, y, cons);
}

function makeSceneLaunchCallback(newSceneName, oldSceneName='titleScene') {
  // Basically makes the callback used for launching a new scene, deleting
  // the current scene's menu elements, and stopping the current scene.
  return () => {
    console.log('test');
    menuCursor.destroy();
    destroyMenuButtons();
    destroyAllText();
    parentThis.scene.launch(newSceneName);
    parentThis.scene.stop(oldSceneName);
  };
}

function createSceneMenuCursor(startingButtonId) {
  let menuCursorArgs = [
    parentThis,
    menuButtons[startingButtonId].x,
    menuButtons[startingButtonId].y,
    'menuCursor',
    startingButtonId
  ];
  return new menuCursorClass(...menuCursorArgs);
}