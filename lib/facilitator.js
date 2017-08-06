const execall = require('execall');

const VARIABLE_REGEX = /\{([^\}]*)\}/gm;
const VARIABLE_NAME_REGEX = /\{([^\}]*)\}/;
const COMMENT_REGEX = /!--.*\n/;
const CONTEXT_VARIABLE_REGEX = /\{{2}([^\}]*)\}{2}/;
const QUOTED_TEXT = '\"([^"]*)\"';

function Facilitator() {
  this.skills = [];
};

Facilitator.prototype.register = function(expression, callback, definitions = {}) {
  let instruction = expression;

  let variables = execall(VARIABLE_REGEX, instruction);
  variables.forEach((variable) => {
    let name = variable.sub[0];
    let regex = definitions[name] || QUOTED_TEXT;
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
};

Facilitator.prototype.exec = function(script, context = {}) {
  script = script.replace(COMMENT_REGEX, '');

  let commands = [];
  this.skills.forEach((skill) => {
    let regex = new RegExp(skill.instruction, 'gm');
    let results = execall(regex, script);
    results.forEach((result) => {
      commands.push({
        index: result.index,
        parameters: result.sub,
        skill: skill
      });
    });
  });

  commands.sort((a1, a2) => {
    if (a1.index < a2.index)
      return -1;
    else if (a1.index > a2.index)
      return 1;
    return 0;
  });

  commands.forEach((command) => {
    let parameters = [];
    let action = command.skill.action;

    command.parameters.forEach((parameter) => {
      parameters.push(replaceParameter(parameter, context));
    });

    parameters.push(context);

    console.log('[DEBUG] ' + action.expression, parameters);
    action.callback.apply(null, parameters);
  });
};

function replaceParameter(parameter, context) {
  let text = parameter;
  let results = execall(CONTEXT_VARIABLE_REGEX, text);
  results.forEach((result) => {
    let variable = result.match;
    let name = result.sub[0];
    let value = getValueFromContext(context, name);
    if (value)
      text = text.replace(variable, value);
  });
  return text;
}

function getValueFromContext(context, name) {
  let keys = name.split('.');
  let value = context[keys[0]];
  keys.splice(1).forEach((key) => {
    if (value === undefined)
      return;
    value = value[key];
  });
  return value;
}

module.exports = Facilitator;
