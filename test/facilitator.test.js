const Facilitator = require('../lib/facilitator');

describe('facilitator', () => {
  let facilitator, callback;

  beforeEach(() => {
    callback = jest.fn();
  	facilitator = new Facilitator();
  });

  describe('compile', () => {
    let commands;

    describe('without variables', () => {
      beforeEach(() => {
      	facilitator.register('this instruction', callback);
      });

      describe('no matches', () => {
        beforeEach(() => {
        	commands = facilitator.compile('this is the text');
        });

        it('returns empty array', () => {
          expect(commands).toEqual([]);
        });
      });

      describe('partial match', () => {
        beforeEach(() => {
        	commands = facilitator.compile('starts with this instruction');
        });

        it('returns one command', () => {
          expect(commands.length).toEqual(1);
        });

        it('returns 12 as index position', () => {
          expect(commands[0].index).toEqual(12);
        });

        it('returns 28 as end position', () => {
          expect(commands[0].end).toEqual(28);
        });

        it('returns "this instruction" as skill instruction', () => {
          expect(commands[0].skill.instruction).toEqual('this instruction');
        });
      });
    });

    describe('with variables', () => {
      beforeEach(() => {
      	facilitator.register('set {name} to {value}', callback);
      });

      describe('matching', () => {
        beforeEach(() => {
        	commands = facilitator.compile('set "name" to "John"');
        });

        it('returns one command', () => {
          expect(commands.length).toEqual(1);
        });

        it('returns "set {name} to {value}" as skill expression', () => {
          expect(commands[0].skill.action.expression).toEqual('set {name} to {value}');
        });

        it('returns "name" and "John" as parameters', () => {
          expect(commands[0].parameters).toEqual(['name', 'John']);
        });
      });
    });

    describe('multiple instructions', () => {
      beforeEach(() => {
      	facilitator.register('first instruction', callback);
      	facilitator.register('second instruction', callback);
      });

      describe('sorted ascending', () => {
        beforeEach(() => {
        	commands = facilitator.compile('first instruction and second instruction');
        });

        it('returns first and second instruction', () => {
          expect(commands[0].skill.action.expression).toEqual('first instruction');
          expect(commands[1].skill.action.expression).toEqual('second instruction');
        });
      });

      describe('sorted descending', () => {
        beforeEach(() => {
        	commands = facilitator.compile('second instruction and first instruction');
        });

        it('returns second and first instruction', () => {
          expect(commands[0].skill.action.expression).toEqual('second instruction');
          expect(commands[1].skill.action.expression).toEqual('first instruction');
        });
      });
    });

    describe('nested instructions', () => {
      beforeEach(() => {
      	facilitator.register('execute {action}', callback, {action: '(.+)'});
      	facilitator.register('first instruction', callback);
      	facilitator.register('second instruction', callback);
      });

      describe('sorted descending', () => {
        beforeEach(() => {
          commands = facilitator.compile('execute second instruction and first instruction');
        });

        it('returns second, first and execute', () => {
          expect(commands[0].skill.action.expression).toEqual('second instruction');
          expect(commands[1].skill.action.expression).toEqual('first instruction');
          expect(commands[2].skill.action.expression).toEqual('execute {action}');
        });
      });

      describe('sorted ascending', () => {
        beforeEach(() => {
          commands = facilitator.compile('execute first instruction and second instruction');
        });

        it('returns second, first and execute', () => {
          expect(commands[0].skill.action.expression).toEqual('first instruction');
          expect(commands[1].skill.action.expression).toEqual('second instruction');
          expect(commands[2].skill.action.expression).toEqual('execute {action}');
        });
      });
    });
  });
});
