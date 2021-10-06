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
      return Object.assign(JSON.parse(parsed.arg), { nosave: true });
    } catch (e) {
      return null;
    }
  }
};
