const Level = {
  DEBUG: 1,
  INFO: 2,
  WARN: 3,
  ERROR: 4
};

let currentLevel = Level.DEBUG;

module.exports = {
  Level: Level,
  getLevel: function() {
    return currentLevel;
  },
  setLevel: function(level) {
    currentLevel = level;
  },
  debug: function(message) {
    if (currentLevel <= Level.DEBUG) {
      console.log('[DEBUG]', message);
    }
  },
  info: function(message) {
    if (currentLevel <= Level.INFO) {
      console.log('[INFO]', message);
    }
  },
  warn: function(message) {
    if (currentLevel <= Level.WARN) {
      console.log('[WARN]', message);
    }
  },
  error: function(message, cause) {
    if (currentLevel <= Level.ERROR) {
      if (cause) {
        console.log('[ERROR]', message, cause);
      } else {
        console.log('[ERROR]', message);
      }
    }
  },
};
