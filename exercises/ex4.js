#!/usr/bin/env node

"use strict";

var util = require("util");
var path = require("path");
var fs = require("fs");

var sqlite3 = require("sqlite3");
// require("console.table");

// ************************************

// Here the DB will be stored
const DB_PATH = path.join(__dirname, "my.db");
const DB_SQL_PATH = path.join(__dirname, "mydb.sql");

var args = require("minimist")(process.argv.slice(2), {
  string: ["other"],
});

main().catch(console.error);

// ************************************

var SQL3;

async function main() {
  if (!args.other) {
    error("Missing '--other=..'");
    return;
  }

  // define some SQLite3 database helpers
  var myDB = new sqlite3.Database(DB_PATH);
  SQL3 = {
    run(...args) {
      return new Promise(function c(resolve, reject) {
        myDB.run(...args, function onResult(err) {
          if (err) reject(err);
          else resolve(this);
        });
      });
    },
    get: util.promisify(myDB.get.bind(myDB)),
    all: util.promisify(myDB.all.bind(myDB)),
    exec: util.promisify(myDB.exec.bind(myDB)),
  };

  var initSQL = fs.readFileSync(DB_SQL_PATH, "utf-8");

  // Execute SQL schema
  await SQL3.exec(initSQL);

  var other = args.other;
  var something = Math.trunc(Math.random() * 1e9);

  // ***********

  let otherID = await insertOrLookupOther(other);

  if (otherID) {
    let result = await insertSomething(otherID, something);

    if (result) {
      let all = await getAllRecords();
      console.table(all);
    }
  }

  error("Oops!");
}

async function insertSomething(id, something) {
  let res = await SQL3.run(
    `
      INSERT INTO
        Something (otherID, data)
      VALUES
        (?, ?)
    `,
    id,
    something
  );

  // changes indicates that something was changes if > 0
  return res && res.changes > 0;
}

async function insertOrLookupOther(other) {
  // The way to interpolate a value is putting a ?
  let res = await SQL3.get(
    `
    SELECT
      id
    FROM
      Other
    WHERE
    data = ?
  `,
    other
  );

  if (res && res.id) {
    return res.id;
  } else {
    // Run is to insert or update.
    // Other is table, data is column
    res = await SQL3.run(
      `
      INSERT INTO
        Other (data)
      VALUES
        (?)
    `,
      other
    );

    if (res && res.lastID) {
      return res.lastID;
    }
  }
}

async function getAllRecords() {
  const res = await SQL3.all(
    `
      SELECT
        Other.data AS 'other',
        Something.data as 'something'
      FROM
        Something JOIN Other
        ON (Something.otherID = Other.id)
      ORDER BY
        Other.id DESC, Something.data ASC
    `
  );

  if (res && res.length > 0) {
    return res;
  }
}

function error(err) {
  if (err) {
    console.error(err.toString());
    console.log("");
  }
}
