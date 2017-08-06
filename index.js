#!/usr/bin/env node

const fs = require('fs');
const Facilitator = require('./lib/facilitator');
const general = require('./lib/general');

// module.exports = {
//   facilitator: facilitator,
//   general: general
// };

const facilitator = new Facilitator();
general.install(facilitator);

let files = process.argv.splice(2);
files.forEach((file) => {
  let content = fs.readFileSync(file);
  facilitator.exec(content.toString());
});
