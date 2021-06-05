const db = require("./../../../service/database");

module.exports = () => {
  return {
    type: "flex",
    altText: "yntkts".toUpperCase(),
    contents: db.open(`bot/assets/yntkts.json`).get()
  };
};
