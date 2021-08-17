module.exports = {
  data: {
    name: "Youtube random",
    description: "Buat nampilin video random dari yt",
    usage: "[@bot/!] ytr <query>",
    CMD: "ytr",
    ALIASES: []
  },
  run: (parsed, event, bot) => {
    parsed.args.random = true;
    return bot.mustcall.yt(parsed, event);
  }
};
