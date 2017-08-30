module.exports = {
  Level: {
    DEBUG: 1,
    INFO: 2,
    WARN: 3,
    ERROR: 4
  },
  level: this.Level.INFO,
  debug: function(message) {
    if (this.level <= this.Level.DEBUG) {
      console.log('[DEBUG]', message);
    }
  },
  info: function(message) {
    if (this.level <= this.Level.INFO) {
      console.log('[INFO]', message);
    }
  },
  warn: function(message) {
    if (this.level <= this.Level.WARN) {
      console.log('[WARN]', message);
    }
  },
  error: function(message, cause) {
    if (this.level <= this.Level.ERROR) {
      if (cause) {
        console.log('[ERROR]', message, cause);
      } else {
        console.log('[ERROR]', message);
      }
    }
  },
};
