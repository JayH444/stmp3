function resetGlobalVarsForLevelAdvance(willAdvance=true) {
  let nextLevel = levelNumber;
  let nextLevelHealth = player.health;
  if (nextLevel < levels.length-1 && willAdvance == true) nextLevel++;
  resetGlobalVars()
  levelNumber = nextLevel;
  lastLevelHealth = nextLevelHealth;
}

function completeLevel(willAdvance=true) {
  canPause = false;
  if (!textObjects.hasOwnProperty('levelClearedText')) {
    printTextCenter('Level cleared!', 'levelClearedText');
  }
  setTimeout(() => {
    parentThis.scene.launch('levelIntroScene');
    parentThis.scene.stop('mainScene');
    resetGlobalVarsForLevelAdvance(willAdvance);
  }, 3000);
}