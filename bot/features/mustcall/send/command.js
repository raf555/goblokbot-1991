const db = require("@utils/database");
module.exports = () => {
  return {
    type: "flex",
    altText: "Command",
    contents: db.open(`bot/assets/send/cmd.json`).get()
  };
};
