let { run: h } = require("./hololive");
module.exports = {
  data: {
    name: "Hololive command",
    description: "Buat ngirim liver yg lg live",
    help: "",
    createdAt: 0,
    CMD: "hn",
    ALIASES: []
  },
  run: (parsed, event) => {
    parsed.args.now = true;
    return h(parsed, event);
  }
};
