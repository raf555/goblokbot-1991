const db = require("./../../../../service/database");

module.exports = () => {
  return db.open("bot/assets/gblk.json").get();
};
