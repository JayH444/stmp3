function completeLevel(advance=true) {
  if (!textObjects.hasOwnProperty('levelClearedText')) {
    printTextCenter('Level cleared!', 'levelClearedText');
  }
  setTimeout(() => {
    if (levelNumber < levels.length-1 && advance == true) levelNumber++;
    parentThis.scene.launch('levelIntroScene');
    parentThis.scene.stop('mainScene');
    resetGlobalVars()
  }, 3000);
}