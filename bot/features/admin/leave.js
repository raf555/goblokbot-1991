const { client } = require("./../../../service/line");
module.exports = (parsed, event) => {
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
};
