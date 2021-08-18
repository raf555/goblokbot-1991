const db = require("@utils/database");

module.exports = () => {
  return db.open("bot/assets/gblk.json").get();
};
