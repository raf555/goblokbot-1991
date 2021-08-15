let { run: h } = require("./hololive");
module.exports = {
  data: {
    name: "Hololive command",
    description: "Buat ngirim liver yg lg live",
    usage: "[@bot/!] hn",
    createdAt: 0,
    DISABLED: true,
    CMD: "hn",
    ALIASES: []
  },
  run: (parsed, event) => {
    parsed.args.now = true;
    return h(parsed, event);
  }
};
