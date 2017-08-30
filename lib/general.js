const execall = require('execall');

const VARIABLE_NAME_REGEX = /\{([^\}]*)\}/;

module.exports = {
  install: (facilitator) => {
    facilitator.register('learn skill {name}', (name) => {
      let module = require(name + '-facilitator-skill');
      module.install(facilitator);
    });

    facilitator.register('define:(.*)\n([\\s\\S]+\n(?=\n|$))', (name, script) => {
      let variables = [];

      let results = execall(VARIABLE_NAME_REGEX, name);
      results.forEach((result) => {
        let variable = result.sub[0];
        variables.push(variable);
      });

      facilitator.register(name, (...args) => {
        let context = args[args.length - 1];

        for (let i = 0; i < variables.length; i++) {
          let variable = variables[i];
          let value = args[i];
          context[variable] = value;
        }
        facilitator.exec(script, context);
      });
    });

    facilitator.register('let {variable} as {value}',
      (variable, value, context) => {
        context[variable] = value;
      }
    );

    facilitator.register('print {text}', (text) => {
      console.log('[OUT] ' + text);
    });
  }
};
