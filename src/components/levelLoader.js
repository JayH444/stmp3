function loadLevelTilesheets() {
  // Loads the level tilesheets of the game in the "levels" folder.
  let fs = require('fs');
  let fileNames = fs.readdirSync('../dev/root/dist/levels');
  let res = [];
  for (let file of fileNames) {
    if (file == 'readme.txt') continue;
    let level = fs
      .readFileSync(`../dev/root/dist/levels/${file}`, 'utf-8')
      .split(/\r\n|\n/);  // Windows and Linux/Unix compatible!
    res.push(level);
  }
  return res;
}

let gameLevels = loadLevelTilesheets();

// Level loading code:
let level = gameLevels[Math.floor(Math.random()*gameLevels.length)];

let spriteForKey = {
  g: 'groundgrass', r: 'ground', s: 'scoreboard',
};

function createEdgeNode(x, y) {
  edgeNodes.create(x, y, 'edgenode');
}

function createZombieSpawn(x, y) {
  zombieSpawnpoints.push([x, y])
}

let functionForKey = {
  z: createZombieSpawn, e: createEdgeNode
};

function getValidItemSpawnAreas(level) {
  let res = [];
  for (let row = 2; row < level.length; row++) {
    for (let col = 1; col < level[row].length - 1; col++) {
      let conditions = (
        spriteForKey.hasOwnProperty(level[row][col]) &&
        level[row-1][col] == 'n'
      );
      if (conditions) {
        res.push([col * 16 - 8, (row-1) * 16 + 8]);
      }
    }
  }
  return res;
}

let ValidItemSpawnAreas = getValidItemSpawnAreas(level);