const jimp = require("./jimp");
const db = require("./../../../service/database");

module.exports = {
  data: {
    name: "MASHUP PP",
    description: "Command buat gabungin 2 poto profil user",
    help: "",
    createdAt: 0,
    CMD: "mashup-pp",
    ALIASES: ["mashuppp", "mpp"]
  },
  run: async (parsed, event) => {
    let userdbval = Object.values(db.open("db/user.json").get());
    let user1 = userdbval[Math.floor(Math.random() * userdbval.length)].key;
    let user2 = userdbval[Math.floor(Math.random() * userdbval.length)].key;

    parsed.args = {
      fromuser: user1,
      resize: "512,512",
      composite: ` -fromuser ${user2} -resize 512,512 -crop '-pos 0,0 -w width/2 -h height'`
    };

    let out = await jimp(parsed, event);

    if (out) {
      out.cmd = "";
    }

    return out;
  }
};
