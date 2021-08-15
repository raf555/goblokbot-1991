const { isAdmin } = require("./../../utility");

module.exports = {
  data: {
    name: "Goblok cmd",
    description: "Fitur buat ngatain bot goblok",
    usage: "[@bot/!] goblok",
    createdAt: 0,
    CMD: "goblok",
    ALIASES: ["gblk"]
  },
  run: (parsed, event, bot) => {
    return {
      type: "text",
      text: isAdmin(event.source.userId) ? "maap bang :(" : "lo goblok",
      cmd: ""
    };
  }
};
