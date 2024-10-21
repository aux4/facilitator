#!/usr/bin/env node

import fs from "fs";
import Facilitator, { install } from "../index.js";

const facilitator = new Facilitator();
install(facilitator);

const files = process.argv.splice(2);

if (files.length === 0) {
  console.error("[ERROR] No files provided");
  process.exit(2);
}

files.forEach(file => {
  let content;
  try {
    content = fs.readFileSync(file);
  } catch (e) {
    console.error("[ERROR] Error reading file: " + file, "\n\t" + e.message);
    process.exit(1);
  }

  try {
    facilitator.exec(content.toString());
  } catch (e) {
    console.error("[ERROR] Error executing file: " + file, "\n\t" + e.message);
    process.exit(1);
  }
});
