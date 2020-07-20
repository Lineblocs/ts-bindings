var fs = require("fs");
const express = require('express')
const bodyParser = require('body-parser');
const tsc = require('node-typescript-compiler');
var fs = require("fs");
var path = require("path");
var tmp = require("tmp");
const app = express()
const port = 3000
var compilerTypings;
var base = fs.readFileSync(__dirname+"/files/defs.ts");




compilerTypings = base.toString('UTF-8');


// parse application/json
app.use(bodyParser.json())
app.post('/compile', (req, res) => {
    var code = req.body.code;
    var compile = compilerTypings + "\r\n" + code;
    tmp.file(async function _tempFileCreated(err, path, fd, cleanupCallback) {
        if (err) throw err;
        
        console.log('File: ', path);
        console.log('Filedescriptor: ', fd);
        var out = path + ".out";
        try {
            await fs.promises.appendFile(path, compile);
        } catch (err) {
            res.statusCode(500);
            res.json({"error": "Internal"});
            return;
        }
        try {
            var log = await tsc.compile({
                outFile: out
            }, file, {verbose: true})
            console.log("result ", log);
            var result = await fs.promises.readFile(loc);
            res.json({"compiled": result.toString('UTF-8')})  ;

        } catch (err) {
            res.statusCode(500);
            res.json({"error": "Compile", "code": err});
            return;
        }
        cleanupCallback();
    });

    tsc.compile({
        //'project': '.'
        outFile: loc
    }, file, {verbose: true})
    .then(function(log) {
        console.log("result ", log);
        console.log(fs.readFileSync(loc).toString('UTF-8'));
    }, function(err) {
        console.log(err);
    });

});
app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))
tmp.file(async function _tempFileCreated(err, path, fd, cleanupCallback) {
  if (err) throw err;
 
  console.log('File: ', path);
  console.log('Filedescriptor: ', fd);
  await fs.promises.appendFile(path, "test");
  console.log((await fs.promises.readFile(path)).toString('UTF-8'));

  // If we don't need the file anymore we could manually call the cleanupCallback
  // But that is not necessary if we didn't pass the keep option because the library
  // will clean after itself.
  cleanupCallback();
});