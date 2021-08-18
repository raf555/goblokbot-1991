const { isAdmin, pushMessage } = require("@bot/utility");

module.exports = {
  data: {
    name: "Push Message Command",
    description: "Command buat push message ke grup",
    usage: "[@bot/!] push <message>",
    ADMIN: true,
    CMD: "push",
    ALIASES: []
  },
  run: (parsed, event, bot) => {
    if (!isAdmin(event.source.userId)) return false;
    if (parsed.args.cmd) {
      bot.function.exec(parsed.args.cmd, event).then(rep => {
        if (rep) {
          pushMessage(rep, process.env.group_id);
        }
      });
    } else {
      let msg = {
        type: "text",
        text: parsed.arg
        /*sender: {
        name: "Admin",
        iconUrl: "https://i.ibb.co/wp1gJ6k/Untitled.png"
      }*/
      };

      pushMessage(msg, process.env.group_id);
    }

    return null;
  }
};
