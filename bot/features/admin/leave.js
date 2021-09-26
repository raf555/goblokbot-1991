const { client } = require("@utils/line");
module.exports = {
  data: {
    name: "Leave Command",
    description: "Command buat nyuruh bot leave",
    usage: "[@bot/!] leave",
    ADMIN: true,
    CMD: "leave",
    ALIASES: []
  },
  run: async (parsed, event, bot) => {
    if (event.source.groupId) {
      await client.leaveGroup(event.source.groupId);
    } else if (event.source.roomId) {
      await client.leaveRoom(event.source.roomId);
    }
    return null;
  }
};
