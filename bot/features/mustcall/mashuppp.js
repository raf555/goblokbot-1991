const jimp = require("./jimp");
const db = require("./../../../service/database");

module.exports = (parsed, event) => {
  let userdbval = Object.values(db.open("db/user.json").get());
  let user1 = userdbval[Math.floor(Math.random() * userdbval.length)].key;
  let user2 = userdbval[Math.floor(Math.random() * userdbval.length)].key;

  parsed.args = {
    fromuser: user1,
    resize: "512,512",
    composite: ` -fromuser ${user2} -resize 512,512 -crop '-pos 0,0 -w width/2 -h height'`
  };

  return jimp(parsed, event);
};
