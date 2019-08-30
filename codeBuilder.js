// This takes all the files in the src directory and builds them 
// into the index.js file in the dist directory. 
// Has an option for code minification.

const fs = require('fs');
const path = require('path');

function fileWalker(dir) {
  // Gets all the files in a directory recursively.
  let dirContents = fs.readdirSync(dir);
  let files = [];
  for (let item of dirContents) {
    let fullPath = path.resolve(dir, item);
    if (fs.statSync(fullPath).isDirectory()) {
      // If a directory, execute a recursive call.
      files = files.concat(fileWalker(fullPath));
    }
    else {
      files.push(fullPath);
    }
  }
  return files;
}

function fetchjsFiles(dir) {
  // Fetches javaScript files and categorizes them.
  let res = {
    scenes: [],
    functions: [],
    components: [],
    actors: [],
    pickupables: [],
    props: [],
    main: []
  };
  let files = fileWalker(dir)
  for (let i of files) {
    if ((/\w+\.js$/).test(i)) {
      let curr = i.match(/(?<=root\\).+/)[0];
      if (curr == 'main.js') {
        res.main.push(curr);
      }
      else {
        let category = curr.match(/src\\(\w+).+/)[1];
        res[category].push(curr);
      }
    }
  }
  return res;
}

function runCodeBuilder(jsFiles, haveSeparators=true, minify=false) {
  // Exactly what it says on the tin. Runs the code builder.
  let concatedScripts = [];
  let output = [];

  function concatScript(s) {
    // Prevents the same script from being concatenated twice.
    if (concatedScripts.includes(s) == false) {
      concatedScripts.push(s);
      if (minify) {
        output.push(fs.readFileSync(s, 'utf8'));
      }
      else {
        let arg;
        if (haveSeparators) {
          let start = (`//- ${s} -`).padEnd(79, '/');
          let end = '/'.repeat(79);
          arg = `${start}\n\n${fs.readFileSync(s, 'utf8')}\n\n${end}`;
        }
        else {
          arg = fs.readFileSync(s, 'utf8');
        }
        output.push(arg);
      }
    }
  }
  
  function concatScriptsInArray(arr) {
    // Concatenates the scripts in an array to the output file.
    if (Array.isArray(arr)) {
      for (let i of arr) {
        concatScript(i);
      }
    }
  }
  
  function concatAllScripts(files) {
    // Concatenates all of the game's the scripts to the output file.
    // The order before main (main always comes LAST!) (in this sequence):
    // scenes -> functions -> components -> actors -> -> pickupables -> props
    // For actors/pickupables/props, genericActor/Pickupable/Prop
    // should load first.
    concatScriptsInArray(files.scenes);
    concatScriptsInArray(files.functions);
    concatScriptsInArray(files.components);
    concatScript(String.raw`src\actors\genericActor.js`);
    concatScript(String.raw`src\actors\enemyActor.js`);
    concatScriptsInArray(files.actors);
    concatScript(String.raw`src\pickupables\genericPickupable.js`);
    concatScriptsInArray(files.pickupables);
    concatScriptsInArray(files.props);
    concatScriptsInArray(files.main);
  }

  concatAllScripts(jsFiles);
  
  let strict = '\'use strict\';\n\n';
  fs.writeFileSync("dist/index.js", strict + output.join('\n\n\n'));
  console.log('File saved successfully!\n');
  
  if (minify) {
    console.log('Minifying file code...\n');
    let compressor = require('node-minify');
    // Using Google Closure Compiler:
    let compressorArgs = {
      compressor: 'gcc',
      input: 'dist/index.js',
      output: 'dist/index.js',
      callback: function(err, min) {
        if (err) console.log('Error encountered.');
        else {
          console.log('File minification completed successfully!\n');
        }
      },
    };
    compressor.minify(compressorArgs);
  }
}

runCodeBuilder(fetchjsFiles('./src'), haveSeparators=false, minify=false);