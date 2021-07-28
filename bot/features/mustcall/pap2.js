module.exports = {
  data: {
    name: "Pap2",
    description: "Command PAP tapi 12 gambar",
    help: "",
    createdAt: 0,
    CMD: "pap2",
    ALIASES: ["p2"]
  },
  run: (parsed, event, bot) => {
    parsed.args.n = 12;
    return bot.mustcall.pap(parsed, event);
  }
};
