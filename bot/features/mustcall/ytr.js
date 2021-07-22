const { run: yt } = require("./yt");

module.exports = {
  data: {
    name: "Youtube random",
    description: "Buat nampilin video random dari yt",
    help: "",
    createdAt: 0,
    CMD: "ytr",
    ALIASES: ["youtube-random"]
  },
  run: (parsed, event) => {
    parsed.args.random = true;
    return yt(parsed, event);
  }
};
