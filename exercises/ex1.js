#!/usr/bin/env node

"use strict";

var path = require("path");
var fs = require("fs");

// You can use getStdin with a pipe to input content to the file: 
// "cat a-file.txt | ./ex1.js --in" (or _)
var getStdin = require("get-stdin");

// You can call the file with a file path, or you can pipe a string (e.g. from doing cat on file) to the program
var args = require("minimist")(process.argv.slice(2),{
	boolean: ["help","in",],
	string: ["file",],
});

const BASEPATH =
	path.resolve(process.env.BASEPATH || __dirname);


if (args.help || process.argv.length <= 2) {
	error(null,/*showHelp=*/true);
}
// underscore (_) is everything minimist couldn't process.
else if (args._.includes("-") || args.in) {
	getStdin().then(processFile).catch(error);
}
else if (args.file) {
	let filePath = path.join(BASEPATH,args.file);
	fs.readFile(filePath,function(err,contents){
		if (err) error(err.toString());
		else processFile(contents.toString());
	});
}
else {
	error("Usage incorrect.",/*showHelp=*/true);
}




// ************************************

function printHelp() {
	console.log("ex1 usage:");
	console.log("");
	console.log("--help                      print this help");
	console.log("-, --in                     read file from stdin");
	console.log("--file={FILENAME}           read file from {FILENAME}");
	console.log("");
	console.log("");
}

function error(err,showHelp = false) {
	process.exitCode = 1;
	console.error(err);
	if (showHelp) {
		console.log("");
		printHelp();
	}
}

function processFile(text) {
	text = text.toUpperCase();
	process.stdout.write(text);
}
