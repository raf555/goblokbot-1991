const { isAdmin } = require("@bot/utility");

module.exports = {
  data: {
    name: "Goblok cmd",
    description: "Fitur buat ngatain bot goblok",
    usage: "[@bot/!] goblok",
    CMD: "goblok",
    ALIASES: ["gblk"]
  },
  run: (parsed, event, bot) => {
    return {
      type: "text",
      text: isAdmin(event.source.userId) ? "maap bang :(" : "lo goblok"
    };
  }
};
