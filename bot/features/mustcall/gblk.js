const { isAdmin } = require("./../../utility");

module.exports = {
  data: {
    name: "Goblok cmd",
    description: "Fitur buat ngatain bot goblok",
    help: "",
    createdAt: 0,
    CMD: "goblok",
    ALIASES: ["gblk"]
  },
  run: (parsed, event) => {
    return {
      type: "text",
      text: isAdmin(event.source.userId) ? "maap bang :(" : "lo goblok",
      cmd: ""
    };
  }
};
