// Functions for image-based text creation

function printText(str, x, y, id) {
  // Prints a text element to the scene and puts it in the textObjects array.
  let offset = x;
  let wordImages = [];
  for (let letter of str) {
    let charCode = letter.charCodeAt(0) - 32;
    let curr = parentThis.add.image(offset, y, 'fontmap', charCode);
    curr.setDepth(1);
    wordImages.push(curr);
    offset += 8;  // Offset for each respective letter.
  }
  textObjects[id] = wordImages;
}

function printTextCenter(str, id, y=centerY-4) {
  printText(str, centerX - (str.length*8/2) + 4, y, id);
}

function changeText(textId, newText) {
  // General function for changing text. E.g. change 'banana' to 'cool guy'.
  if (newText.length === 0) {
    console.log('Cannot change text object length to zero.')
    return;
  }
  let currText = textObjects[textId];
  let x = currText[0].x;
  let y = currText[0].y;
  for (let i of currText) {
    i.destroy();
  }
  textObjects[textId] = [];
  currText = textObjects[textId];
  for (let i in newText) {
    let charCode = newText.charCodeAt(i) - 32;
    let l = parentThis.add.image(x, y, 'fontmap', charCode)
    currText.push(l);
    x += 8;
  }
}

function centerTextX(textId) {
  let textLength = textObjects[textId].length;
  let offset = centerX - (textLength*8/2) + 4;
  for (let letter of textObjects[textId]) {
    letter.x = offset;
    offset += 8;
  }
}

function updateText(textId, getText) {
  // General function for updating text. More performance-friendly than 
  // changeText(). This CANNOT alter the length of text!!! 
  // Use "changeText" for that instead.
  // getText referrs to the 'get' method for the given text, 
  // e.g. player.getScore, gameTimer.getTimeRemaining, etc.
  let newText = getText();
  textObjects[textId].forEach((img, i) => {
    img.setTexture('fontmap', newText.charCodeAt(i) - 32);
  });
}

function destroyText(textId) {
  // Removes a text element.
  /*console.log(textId);
  console.log(textObjects[textId]);*/
  for (let i of textObjects[textId]) {
    i.destroy();
  }
  textObjects[textId] = undefined;
  delete textObjects[textId];
}