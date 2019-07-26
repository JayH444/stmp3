function loadLevelTilesheets() {
  // Loads the level tilesheets of the game in the "levels" folder, and
  // returns an array of the keys for the levels.
  let files = fs.readdirSync('./root/dist/levels');
  let res = [];
  for (let file of files) {
    // fileKey is basically the file name:
    let fileKey = file.match(/(\w+)\.json/)[1];
    parentThis.load.tilemapTiledJSON(
      fileKey,
      `levels/${file}`
    );
    res.push(fileKey);
  }
  return res;
}

function randomLevel() {
  return levels[Math.floor(Math.random()*levels.length)];
}

function createEdgeNode(x, y) {
  edgeNodes.create(x, y, 'edgenode');
}


function createEnemySpawn(x, y) {
  enemySpawnpoints.push([x, y]);
}

function createZombieSpawn(x, y) {
  createEnemySpawn(x, y);
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
