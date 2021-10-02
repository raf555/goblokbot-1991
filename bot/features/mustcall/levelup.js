module.exports = {
  data: {
    name: "Levelup Command",
    description: "Reserved for system",
    usage: "[@bot/!] levelup",
    CMD: "levelup",
    ALIASES: []
  },
  run: function(parsed, event, bot) {
    if (!parsed.arg) {
      return null;
    }
    try {
      return JSON.parse(parsed.arg);
    } catch (e) {
      return null;
    }
  }
};
