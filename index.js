import fs from "fs";

const VARIABLE_REGEX = /\{(?<name>[^\}?]*)(?<optional>\?)?\}/gm;
const COMMENT_REGEX = /\s*!--.*\n/;
const CONTEXT_VARIABLE_REGEX = /\{{2}(?<name>[^\}]*)\}{2}/g;
const QUOTED_TEXT = '("(?<VARNAME>[^"]*?)")';
const VARIABLE_EXPRESSION_REGEX = /(?<key>[^\.\[\]]+?)(\[(?<index>[^\]]+)\])*(\.|\n|$)/g;

const DEFAULT_DEFINITIONS = {
  script: /[\s\S]+?/
};

export default class Facilitator {
  constructor() {
    this.skills = [];
  }

  register(expression, callback, definitions = {}) {
    let instruction = expression;

    const expressionDefinitions = Object.assign({}, DEFAULT_DEFINITIONS, definitions);

    const variableRegex = new RegExp(VARIABLE_REGEX);

    let match;
    while ((match = variableRegex.exec(expression)) !== null) {
      const variable = match[0];
      const name = match.groups.name;
      const optional = match.groups.optional === "?";
      const regexVariableDefinition =
        typeof expressionDefinitions[name] === "string"
          ? expressionDefinitions[name]
          : expressionDefinitions[name]?.source;
      const variableRegex = regexVariableDefinition
        ? `(?<${name}>${regexVariableDefinition})`
        : QUOTED_TEXT.replace("VARNAME", name);
      instruction = instruction.replace(variable, `${variableRegex}${optional ? "?" : ""}`);
    }

    this.skills.push({
      instruction: instruction,
      action: {
        expression: expression,
        callback: callback,
        definitions: expressionDefinitions
      }
    });
  }

  compile(script) {
    const commands = [];

    if (!script) {
      return commands;
    }

    const scriptWithNoComments = script.replace(COMMENT_REGEX, "");

    this.skills.forEach(skill => {
      const regex = new RegExp(skill.instruction, "gm");

      let match;
      while ((match = regex.exec(scriptWithNoComments)) !== null) {
        const result = match[0];

        commands.push({
          index: match.index,
          end: match.index + result.length,
          parameters: { ...match.groups },
          skill: skill
        });
      }
    });

    commands.sort((a1, a2) => {
      if (a1.index !== a2.index) {
        return a1.index - a2.index;
      }
      return a2.end - a1.end;
    });

    return commands;
  }

  exec(script, context = {}) {
    const commands = this.compile(script);

    let lastPosition = -1;
    commands.forEach(command => {
      if (command.index < lastPosition) {
        return;
      }

      const parameters = [];
      const action = command.skill.action;

      Object.entries(command.parameters).forEach(([_, value]) => {
        parameters.push(replaceParameter(value, context));
      });

      parameters.push(context);

      try {
        if (process.env.DEBUG === "true") {
          console.error("[DEBUG]", script.substring(command.index, command.end), parameters, { ...context });
        }
        action.callback.apply(null, parameters);
      } catch (e) {
        const failedInstruction = script.substring(command.index, command.end).replace("\n", "\n  ");
        throw new ExecutionError(command, failedInstruction, parameters, e);
      }

      lastPosition = command.end;
    });
  }
}

class ExecutionError extends Error {
  constructor(command, script, params, cause) {
    super(cause.message);
    this.command = command;
    this.script = script;
    this.params = params;
    this.cause = cause;
  }
}

function replaceParameter(parameter, context) {
  if (parameter === undefined || parameter === null) return "";

  let text = parameter;

  const regex = new RegExp(CONTEXT_VARIABLE_REGEX);

  let match;
  while ((match = regex.exec(parameter)) !== null) {
    const variable = match[0];
    const name = match.groups.name;
    const value = getValueFromContext(context, name);

    if (value !== undefined) {
      text = text.replace(variable, value);
    }
  }

  return text;
}

function getValueFromContext(context, name) {
  let value = context;

  const expression = new RegExp(VARIABLE_EXPRESSION_REGEX);

  let match;
  while (value !== undefined && (match = expression.exec(name)) !== null) {
    const params = match.groups;

    value = value[params.key];
    if (value !== undefined && params.index !== undefined) {
      value = value[params.index];
    }
  }

  return value;
}

export function install(facilitator) {
  facilitator.register("learn skill {name}", name => {
    const module = require(name + "-facilitator-skill");
    module.install(facilitator);
  });

  facilitator.register("\\s*eval\n{script}\n\\s*end eval\n", (script, context) => {
    facilitator.exec(script, context);
  });

  facilitator.register("\\s*define\\s+{name}\n{script}\n\\s*end define\n", (name, script) => {
    const variables = [];

    const regex = new RegExp(VARIABLE_REGEX);
    let match;
    while ((match = regex.exec(name)) !== null) {
      const variable = match.groups.name;
      variables.push(variable);
    }

    facilitator.register(name, (...args) => {
      const context = args[args.length - 1];

      for (let i = 0; i < variables.length; i++) {
        const variable = variables[i];
        const value = args[i];
        context[variable] = value;
      }

      facilitator.exec(script, context);
    });
  });

  facilitator.register("set {variable} to {value}", (variable, value, context) => {
    context[variable] = value;
  });

  facilitator.register("print {text}", text => {
    console.log(text);
  });

  facilitator.register("context load file {path}", (path, context) => {
    let json;

    try {
      json = fs.readFileSync(path, { encoding: "utf-8" });
    } catch (e) {
      throw new Error(`Error reading the file ${path}: ${e.message}`);
    }

    let object;

    try {
      object = JSON.parse(json.toString());
    } catch (e) {
      throw new Error(`File ${path} is not a valid JSON`);
    }

    Object.entries(object).forEach(([key, value]) => {
      context[key] = value;
    });
  });

  facilitator.register(
    "context load\n{json}\nend load",
    (json, context) => {
      const object = JSON.parse(json);

      Object.entries(object).forEach(([key, value]) => {
        context[key] = value;
      });
    },
    {
      json: /[\s\S]+?/
    }
  );
}
