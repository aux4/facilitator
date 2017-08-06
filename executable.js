#!/usr/bin/env node

const fs = require('fs');
const Facilitator = require('./lib/facilitator');
const general = require('./lib/general');

const facilitator = new Facilitator();
general.install(facilitator);

let files = process.argv.splice(2);
files.forEach((file) => {
  let content;
  try {
    content = fs.readFileSync(file);
  } catch (e) {
    console.log('[ERROR] Error reading file: ' + file, '\n\t' + e.message);
    return;
  }
  facilitator.exec(content.toString());
});
