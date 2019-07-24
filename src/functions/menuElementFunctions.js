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