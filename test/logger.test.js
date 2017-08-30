const logger = require('../lib/logger');

describe('logger', () => {
  beforeEach(() => {
    global.console = {log: jest.fn()};
  });

  describe('debug', () => {
    describe('when level is DEBUG', () => {
      beforeEach(() => {
        logger.setLevel(logger.Level.DEBUG);
        logger.debug('debug');
      });
      it('should print the log', () => {
        expect(console.log).toBeCalledWith('[DEBUG]', 'debug');
      });
    });

    describe('when log is greater than DEBUG', () => {
      beforeEach(() => {
        logger.setLevel(logger.Level.DEBUG);
        logger.info('info');
      });
      it('should not print the log', () => {
        expect(console.log).toBeCalledWith('[INFO]', 'info');
      });
    });

    describe('when level is greater than DEBUG', () => {
      beforeEach(() => {
        logger.setLevel(logger.Level.INFO);
        logger.debug('debug');
      });
      it('should not print the log', () => {
        expect(console.log).not.toBeCalled();
      });
    });

    describe('info', () => {
      describe('when level is INFO', () => {
        beforeEach(() => {
          logger.setLevel(logger.Level.INFO);
          logger.info('info');
        });
        it('should print the log', () => {
          expect(console.log).toBeCalledWith('[INFO]', 'info');
        });
      });

      describe('when log is greater than INFO', () => {
        beforeEach(() => {
          logger.setLevel(logger.Level.INFO);
          logger.warn('warn');
        });
        it('should not print the log', () => {
          expect(console.log).toBeCalledWith('[WARN]', 'warn');
        });
      });

      describe('when level is greater than INFO', () => {
        beforeEach(() => {
          logger.setLevel(logger.Level.WARN);
          logger.info('info');
        });
        it('should not print the log', () => {
          expect(console.log).not.toBeCalled();
        });
      });
    });

    describe('warn', () => {
      describe('when level is WARN', () => {
        beforeEach(() => {
          logger.setLevel(logger.Level.WARN);
          logger.warn('warn');
        });
        it('should print the log', () => {
          expect(console.log).toBeCalledWith('[WARN]', 'warn');
        });
      });

      describe('when log is greater than WARN', () => {
        beforeEach(() => {
          logger.setLevel(logger.Level.WARN);
          logger.error('error');
        });
        it('should not print the log', () => {
          expect(console.log).toBeCalledWith('[ERROR]', 'error');
        });
      });

      describe('when level is greater than WARN', () => {
        beforeEach(() => {
          logger.setLevel(logger.Level.ERROR);
          logger.warn('warn');
        });
        it('should not print the log', () => {
          expect(console.log).not.toBeCalled();
        });
      });
    });

    describe('error', () => {
      describe('when level is ERROR', () => {
        beforeEach(() => {
          logger.setLevel(logger.Level.ERROR);
          logger.error('error');
        });
        it('should print the log', () => {
          expect(console.log).toBeCalledWith('[ERROR]', 'error');
        });
      });

      describe('when level is greater than ERROR', () => {
        beforeEach(() => {
          logger.setLevel(5);
          logger.error('error');
        });
        it('should not print the log', () => {
          expect(console.log).not.toBeCalled();
        });
      });
    });
  });
});
