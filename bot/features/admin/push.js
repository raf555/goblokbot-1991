const { isAdmin, pushMessage } = require("./../../utility");

module.exports = {
  data: {
    name: "Push Message Command",
    description: "Command buat push message ke grup",
    help: "",
    createdAt: 0,
    CMD: "push",
    ALIASES: []
  },
  run: (parsed, event, bot) => {
    if (!isAdmin(event.source.userId)) return false;
    pushMessage(
      {
        type: "text",
        text: parsed.arg
        /*sender: {
        name: "Admin",
        iconUrl: "https://i.ibb.co/wp1gJ6k/Untitled.png"
      }*/
      },
      process.env.group_id
    );
  }
};
