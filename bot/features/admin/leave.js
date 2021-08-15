const { client } = require("./../../../service/line");
module.exports = {
  data: {
    name: "Leave Command",
    description: "Command buat nyuruh bot leave",
    usage: "[@bot/!] leave",
    createdAt: 0,
    CMD: "leave",
    ALIASES: []
  },
  run: (parsed, event, bot) => {
    if (event.source.groupId) {
      client
        .leaveGroup(event.source.groupId)
        .then(() => {})
        .catch(err => {});
    } else if (event.source.roomId) {
      client
        .leaveRoom(event.source.roomId)
        .then(() => {})
        .catch(err => {});
    }
    return null;
  }
};
