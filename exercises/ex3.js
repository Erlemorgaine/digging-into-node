#!/usr/bin/env node

"use strict";

var path = require("path");
var fs = require("fs");
var Transform = require("stream").Transform; // This is a built-in node package
let zlib = require("zlib"); // Also built-in
let CAF = require("caf");

// You can use getStdin with a pipe to input content to the file:
// "cat a-file.txt | ./ex1.js --in" (or _)
var getStdin = require("get-stdin");

// Minimist is a library for easily setting flag options to the node file.
// You can call the file with a file path, or you can pipe a string (e.g. from doing cat on file) to the program
var args = require("minimist")(process.argv.slice(2), {
  boolean: ["help", "in", "out", "compress", "uncompress"],
  string: ["file"],
});

function streamComplete(stream) {
  return new Promise((res) => {
    // Called on end of stream, when it has flushed itself to the target stream
    stream.on("end", res);
  });
}

const BASEPATH = path.resolve(process.env.BASEPATH || __dirname);

let OUTFILE = path.join(BASEPATH, "out.txt");

if (args.help || process.argv.length <= 2) {
  error(null, /*showHelp=*/ true);
}
// underscore (_) is everything minimist couldn't process.
else if (args._.includes("-") || args.in) {
  // This is code from ex1
  // getStdin().then(processFile).catch(error);
  processFile(process.stdin);
} else if (args.file) {
  let filePath = path.join(BASEPATH, args.file);
  let stream = fs.createReadStream(filePath);
  processFile(stream);

  // This is code from ex1
  // fs.readFile(filePath,function(err,contents){
  // 	if (err) error(err.toString());
  // 	else processFile(contents.toString());
  // });
} else {
  error("Usage incorrect.", /*showHelp=*/ true);
}

// ************************************

function printHelp() {
  console.log("ex3 usage:");
  console.log("");
  console.log("--help                      print this help");
  console.log("-, --in                     read file from stdin");
  console.log("--file={FILENAME}           read file from {FILENAME}");
  console.log("--out 				         print to stdout");
  console.log("--compress 				 compress a file");
  console.log("--uncompress 				 uncompress a file");
  console.log("");
  console.log("");
}

function error(err, showHelp = false) {
  process.exitCode = 1;
  console.error(err);
  if (showHelp) {
    console.log("");
    printHelp();
  }
}

// NB When using streams like this - reading out and writing to the stdout, instead of how we did it before,
function processFile(inStream) {
  let outStream = inStream;

  if (args.uncompress) {
    let gunzipStream = zlib.createGunzip();
    outStream = outStream.pipe(gunzipStream);
  }

  // This is a writable
  let upperStream = new Transform({
    transform(chunk, encoding, callback) {
      // Chunk is a buffer.
      // You can use a setTimeout here to see each chunk being processed

      // Push comes from the fact that transform stream is an object that the makers defined a push function on
      this.push(chunk.toString().toUpperCase()); // In this way we put sth into our stream from the chunk
      callback(); // We need to execute this chunk so that the stream knows the chunk has been processed
    },
  });

  // We do this (reuse outstream) so that we can do several transformations on it without having to
  // make variables for every readable stream in the process
  outStream = outStream.pipe(upperStream);

  let targetStream;

  if (args.out) {
    targetStream = process.stdout; // process.stdout is a writeable stream
  } else {
    // Here we dump the content via a writeable stream to an output file
    targetStream = fs.createWriteStream(OUTFILE);
  }

  outStream.pipe(targetStream);

  await streamComplete(outStream);

  // This is code from ex1, text was the param
  // text = text.toUpperCase();
  // process.stdout.write(text);
}
