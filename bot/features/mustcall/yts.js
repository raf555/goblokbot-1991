module.exports = {
  data: {
    name: "Youtube Search",
    description: "Command buat nyari video dari YT",
    usage:
      "[@bot/!] yts {options} <query>" +
      "\n\noptions:" +
      "\n-n <n> ?: jumlah hasil search (max 12)",
    CMD: "yts",
    ALIASES: []
  },
  run: yts
};

async function yts(parsed, event, bot) {
  parsed.args.search = true;
  return bot.mustcall.yt(parsed, event, bot);
}
