var fs = require("fs");
const express = require('express')
const bodyParser = require('body-parser');
const tsc = require('node-typescript-compiler');
var fs = require("fs");
var path = require("path");
var tmp = require("tmp");
const app = express()
const port = 8080;
var compilerTypings;
var pathToDefs = __dirname+"/files/defs.ts";
var base = fs.readFileSync(pathToDefs);
var lines;




compilerTypings = base.toString('UTF-8');

function countFileLines() {
  return new Promise((resolve, reject) => {
  let lineCount = 0;
  fs.createReadStream(pathToDefs)
    .on("data", (buffer) => {
      let idx = -1;
      lineCount--; // Because the loop will run once for idx=-1
      do {
        idx = buffer.indexOf(10, idx+1);
        lineCount++;
      } while (idx !== -1);
    }).on("end", () => {
      resolve(lineCount);
    }).on("error", reject);
  });
};
// parse application/json
app.use(bodyParser.json())
app.post('/compile', (req, res) => {
    var code = req.body.code;
    var compile = compilerTypings + code;
    tmp.file({ template: 'tmp-XXXXXX.ts' },async function _tempFileCreated(err, path, fd, cleanupCallback) {
        if (err) throw err;
        
        console.log('File: ', path);
        console.log('Filedescriptor: ', fd);
        var out = path.replace(/\.ts/, ".out.ts");
        try {
            await fs.promises.appendFile(path, compile);
        } catch (err) {
            res.status(500);
            res.json({"messager": "Internal Error", "success": false, "typeOfError": "internal"});
            return;
        }
        try {
            var log = await tsc.compile({
                outFile: out
            }, path, {verbose: true})
            console.log("result ", log);
            var result = await fs.promises.readFile(out);
            res.json({"compiled": result.toString('UTF-8'), "success": true})  ;

        } catch (err) {
		console.log("PROGRAM ERRORS: ");
		console.error( err );
		var logs = err.stdout.split("\n").map((line) => {
			var splitted = line.split(":");
			var first = splitted[0];
			var errorLineInfo = first.match(/\(([0-9]+),([0-9]+)\)$/);	
			var line = parseInt( errorLineInfo[1] );
			//subtract the definitions from the line count as the user doesnt see those in the frontend
			line = line - lines;
			var character = parseInt( errorLineInfo[2] );
			var joined = splitted.slice(1, splitted.length).join(":");
			return {
				debug: joined,
				line,
				character
			};
		});
            res.status(500);
            res.json({"success": false, "message": "Unable to compile", "log": logs, "typeOfError": "compile"});
            return;
        }
        cleanupCallback();
    });
});
setImmediate(async function() {
	lines = await countFileLines();
  console.log("lines ", lines);
  app.use(express.static('files'))

	app.listen(port, "0.0.0.0", () => console.log(`Example app listening at http://localhost:${port}`))
});
