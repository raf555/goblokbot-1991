module.exports = {
  data: {
    name: "Youtube random",
    description: "Buat nampilin video random dari yt",
    help: "",
    createdAt: 0,
    CMD: "ytr",
    ALIASES: ["youtube-random"]
  },
  run: (parsed, event, bot) => {
    parsed.args.random = true;
    return bot.mustcall.yt(parsed, event);
  }
};
