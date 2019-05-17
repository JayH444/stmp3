// This code is mostly obsolete. Rewrite it to work with maps made in Tiled!!!

/*function loadLevelTilesheets() {  // Also obsolete, but can be retooled to load .json files...
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
}*/


function loadLevelTilesheets() {
  // Loads the level tilesheets of the game in the "levels" folder, and
  // returns an array of the keys for the levels.
  let fs = require('fs');
  let files = fs.readdirSync('../dev/root/dist/levels');
  let res = [];
  for (let file of files) {
    // fileKey is basically the file name:
    let fileKey = file.match(/(\w+)\.json/)[1];
    parentThis.load.tilemapTiledJSON(
      fileKey,
      `levels/${file}`
    );
    console.log(fileKey);
    console.log(`levels/${file}`);
    res.push(fileKey);
  }
  return res;
}

function randomLevel() {
  return levels[Math.floor(Math.random()*levels.length)];
}

//let gameLevels = loadLevelTilesheets();

// (OBSOLETE) Level loading code:
// let level = gameLevels[Math.floor(Math.random()*gameLevels.length)];

function createEdgeNode(x, y) {
  edgeNodes.create(x, y, 'edgenode');
}

function createZombieSpawn(x, y) {
  zombieSpawnpoints.push([x, y])
}

function getValidItemSpawnAreas() {
  let res = [];
  for (let row of map.layers[0].data.slice(1,)) {
    for (let i in row) {
      let tile = row[i]
      let tileAboveIsEmpty = map.layers[0].data[tile.y-1][i].index == -1;
      let tileOnScreen = tile.x > 0 && tile.x < 21;
      if ([1, 2].includes(tile.index) && tileAboveIsEmpty && tileOnScreen) {
        // 1 and 2 are the ground and ground w/ grass tiles.
        res.push([tile.x*16 - 8, (tile.y-1)*16 + 8]);
      }
    }
  }
  return res;
}

function getValidGrassSpawnAreas() {
  let res = [];
  for (let row of map.layers[0].data) {
    for (let tile of row) {
      let tileOnScreen = tile.x > 0 && tile.x < 21;
      if (tile.index === 2 && tileOnScreen) {
        res.push([tile.x*16 - 8, (tile.y-1)*16 + 8]);
      }
    }
  }
  return res;
}
