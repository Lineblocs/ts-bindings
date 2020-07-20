var fs = require("fs");
const express = require('express')
const bodyParser = require('body-parser');
//var tsc = require('typescript-compiler');
var ts =require('typescript');
var fs = require("fs");
var path = require("path");
const app = express()
const port = 3000
var compilerTypings;


// parse application/json
app.use(bodyParser.json())
app.post('/compile', (req, res) => {
    var code = req.body.code;
    var compile = compilerTypings + "\r\n" + code;

    var js = tsc.compileString(compile, '--lib es2015', null, (err) => {
        console.error( err );
    });
    console.log(js);
});

var base = fs.readFileSync(__dirname+"/files/defs.ts");




compilerTypings = base.toString('UTF-8');
app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))

var ts = require("typescript");
var fs = require("fs");
var path = require("path");

function transform(contents, libSource, compilerOptions) {
    // Generated outputs
    var outputs = [];
    // Create a compilerHost object to allow the compiler to read and write files
    var compilerHost = {
        getSourceFile: function (filename, languageVersion) {
            console.log("source file for: " + filename);
            if (filename === "file.ts") {
                return ts.createSourceFile(filename, contents, compilerOptions.target, "0");
            } else {
                var libSource = fs.readFileSync(__dirname+"/TypeScript/lib/" + filename).toString();
                var result = ts.createSourceFile(filename, libSource, compilerOptions.target, "0");
                console.log(result);
                return result;
            }
        },
        writeFile: function (name, text, writeByteOrderMark) {
            console.log(arguments);
            outputs.push({ name: name, text: text, writeByteOrderMark: writeByteOrderMark });
        },
        getDefaultLibFileName: function () { return "lib.d.ts"; },
        useCaseSensitiveFileNames: function () { return false; },
        getCanonicalFileName: function (filename) { return filename; },
        getCurrentDirectory: function () { return ""; },
        getNewLine: function () { return "\n"; }
    };
    // Create a program from inputs
    var program = ts.createProgram(["file.ts"], compilerOptions, compilerHost);
    // Query for early errors
    var errors = program.getProgramDiagnostics();
    console.log(errors);

    return;
    // Do not generate code in the presence of early errors
    if (!errors.length) {
        // Type check and get semantic errors
        var checker = program.getTypeChecker(true);
        errors = checker.getDiagnostics();
        // Generate output
        checker.emitFiles();
    }
    return {
        outputs: outputs,
        errors: errors.map(function (e) { return e.file.filename + "(" + e.file.getLineAndCharacterFromPosition(e.start).line + "): " + e.messageText; })
    };
}

const tsc = require('node-typescript-compiler');
const { textSpanOverlapsWith } = require("typescript");
var file = __dirname+"/files/defs.ts";
var file = "";
tsc.compile({
    //'project': '.'
}, file, {verbose: true})
.then(function(log) {
    console.log(log);
}, function(err) {
    console.log(err);
});