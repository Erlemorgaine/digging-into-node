"use strict";

// var fetch = require("node-fetch");

const util = require("util");
const childProc = require("child_process");

// ************************************

const HTTP_PORT = 8039;

main().catch(() => 1);

// ************************************

async function main() {
  let x = 0;
  for (let i = 0; i < 1000000000; i++) {
    x += i;
  }

  // This will be 0 anyway, this is just to show that we can modify the exit code
  process.exitCode = 0;
}
