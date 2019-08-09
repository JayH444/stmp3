function addMenuElement(str, func, id, x, y) {
  // Adds a menu option to the valid menu positions array.
  menuElements.push([y, id, func]);
  printText(str, x, y, id);
}

function addMenuElementCenterX(str, func, id, y) {
  // Adds a centered menu option to the valid menu positions array.
  menuElements.push([y, id, func]);
  printTextCenter(str, id, y);
}

function destroyMenuElements() {
  // Destroys the contents of the menuElements array.
  for (let element of menuElements) {
    destroyText(element[1]);
    element = null;
  }
  menuElements = [];
}

function makeSceneLaunchCallback(newSceneName, oldSceneName='titleScene') {
  // Basically makes the callback used for launching a new scene, deleting
  // the current scene's menu elements, and stopping the current scene.
  return () => {
    destroyMenuElements();
    parentThis.scene.launch(newSceneName);
    parentThis.scene.stop(oldSceneName);
  };
}

function createSceneMenuCursor() {
  let menuCursorArgs = [
    parentThis,
    textObjects[menuElements[0][1]][0].x-10,
    textObjects[menuElements[0][1]][0].y,
    'menuCursor',
    menuElements
  ];
  return new menuCursorClass(...menuCursorArgs);
}