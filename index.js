import execall from "execall";

const VARIABLE_REGEX = /\{([^\}]*)\}/gm;
const VARIABLE_NAME_REGEX = /\{([^\}]*)\}/;
const COMMENT_REGEX = /!--.*\n/;
const CONTEXT_VARIABLE_REGEX = /\{{2}([^\}]*)\}{2}/g;
const QUOTED_TEXT = '"([^"]*)"';

export default class Facilitator {
  constructor() {
    this.skills = [];
  }

  register(expression, callback, definitions = {}) {
    let instruction = expression;

    const variables = execall(VARIABLE_REGEX, instruction);
    variables.forEach(variable => {
      const name = variable.subMatches[0];
      const regex = definitions[name] || QUOTED_TEXT;
      instruction = instruction.replace(variable.match, regex);
    });

    this.skills.push({
      instruction: instruction,
      action: {
        expression: expression,
        callback: callback,
        definitions: definitions
      }
    });
  }

  compile(script) {
    const scriptWithNoComments = script.replace(COMMENT_REGEX, "");

    const commands = [];
    this.skills.forEach(skill => {
      const regex = new RegExp(skill.instruction, "gm");
      const results = execall(regex, scriptWithNoComments);
      results.forEach(result => {
        commands.push({
          index: result.index,
          end: result.index + result.match.length,
          parameters: result.subMatches,
          skill: skill
        });
      });
    });

    commands.sort((a1, a2) => {
      if (a1.index < a2.index) {
        if (a1.end < a2.index) {
          return -1;
        } else if (a1.end >= a2.end) {
          return 1;
        } else if (a1.end < a2.index) {
          return -1;
        }
      } else if (a1.index > a2.index) {
        if (a1.index > a2.end) {
          return 1;
        } else if (a2.end < a1.index) {
          return 1;
        } else if (a2.end >= a1.end) {
          return -1;
        }
      }
      return 0;
    });

    return commands;
  }

  exec(script, context = {}) {
    const commands = this.compile(script);

    commands.forEach(command => {
      const parameters = [];
      const action = command.skill.action;

      command.parameters.forEach(parameter => {
        parameters.push(replaceParameter(parameter, context));
      });

      parameters.push(context);

      action.callback.apply(null, parameters);
    });
  }
}

function replaceParameter(parameter, context) {
  let text = parameter;
  const results = execall(CONTEXT_VARIABLE_REGEX, text);
  results.forEach(result => {
    const variable = result.match;
    const name = result.subMatches[0];
    const value = getValueFromContext(context, name);
    if (value) {
      text = text.replace(variable, value);
    }
  });
  return text;
}

function getValueFromContext(context, name) {
  const keys = name.split(".");
  let value = context[keys[0]];
  keys.splice(1).forEach(key => {
    if (value === undefined) return;
    value = value[key];
  });
  return value;
}

export function install(facilitator) {
  facilitator.register("learn skill {name}", name => {
    const module = require(name + "-facilitator-skill");
    module.install(facilitator);
  });

  facilitator.register("define:(.*)\n([\\s\\S]+\n(?=\n|$))", (name, script) => {
    const variables = [];

    const results = execall(VARIABLE_NAME_REGEX, name);
    results.forEach(result => {
      const variable = result.subMatches[0];
      variables.push(variable);
    });

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
}
