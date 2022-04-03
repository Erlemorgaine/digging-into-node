#!/usr/bin/env node

"use strict";

var util = require("util");
var childProc = require("child_process");

// ************************************

const HTTP_PORT = 8039;
// const MAX_CHILDREN = 5;

var delay = util.promisify(setTimeout);

main().catch(console.error);

// ************************************

async function main() {
  // console.log(`Load testing http://localhost:${HTTP_PORT}...`);

  // Start a separate child process: run a file with node
  let child = childProc.spawn("node", ["ex7-child.js"]);

  // Get notified when child process finishes
  child.on("exit", (code) => {
    // You can check exit code implicitly, by running the node file and following up with && <other command line command>.
    // If second command doesn't execute, there was an exit code of 1
    console.log("Child finished", code);
  });
}
