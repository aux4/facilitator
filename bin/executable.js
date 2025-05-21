#!/usr/bin/env node

import fs from "fs";
import Facilitator, { install } from "../index.js";

const facilitator = new Facilitator();
install(facilitator);

const args = process.argv.splice(2);
const action = args[0];

if (action !== "execute" && action !== "list") {
  console.error("[ERROR] Invalid action", action, "use:");
  console.error("facilitator execute <filename>");
  console.error("facilitator list");
  process.exit(2);
}

if (action === "list") {
  const actions = facilitator.skills
    .map(skill => {
      if (skill.action && skill.action.expression) {
        let expr = skill.action.expression
          .replace(/\\n/g, "\n")
          .replace(/\\s\*/g, "")
          .replace(/\\s\+/g, " ")
          .replace(/^[\n\s]+|[\n\s]+$/g, "");
        if (expr.includes("\n")) {
          expr = expr.replace(/\n/g, "\n  ");
        }
        return `* ${expr}`;
      }
      return null;
    })
    .filter(Boolean);
  actions.forEach(action => {
    console.log(action);
  });
  process.exit(0);
}

const files = args.splice(1);

if (files.length === 0) {
  console.error("[ERROR] No files provided");
  process.exit(3);
}

files.forEach(file => {
  let content;
  try {
    content = fs.readFileSync(file);
  } catch (e) {
    console.error("[ERROR] Error reading file: " + file, "\n\t" + e.message);
    process.exit(4);
  }

  try {
    facilitator.exec(content.toString());
  } catch (e) {
    if (e.script) {
      const params = e.params || [];
      console.error(
        "[ERROR] error executing instruction\n",
        "\nError:\n ",
        e.message,
        "\nInstruction:\n ",
        e.script,
        "\nParameters:\n ",
        params.slice(0, params.length - 1).join(" ")
      );
    } else {
      console.error("[ERROR] Error executing file: " + file, "\n\t" + e.message, e);
    }

    process.exit(1);
  }
});
