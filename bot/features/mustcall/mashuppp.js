const db = require("./../../../service/database");

module.exports = {
  data: {
    name: "MASHUP PP",
    description: "Command buat gabungin 2 poto profil user",
    usage: "[@bot/!] mashup-pp",
    DISABLED: true,
    CMD: "mashup-pp",
    ALIASES: []
  },
  run: async (parsed, event, bot) => {
    let userdbval = Object.values(db.open("db/user.json").get());
    let user1 = userdbval[Math.floor(Math.random() * userdbval.length)].key;
    let user2 = userdbval[Math.floor(Math.random() * userdbval.length)].key;

    parsed.args = {
      fromuser: user1,
      resize: "512,512",
      composite: ` -fromuser ${user2} -resize 512,512 -crop '-pos 0,0 -w width/2 -h height'`
    };

    let out = await bot.mustcall.jimp(parsed, event);

    if (out) {
      out.cmd = "";
    }

    return out;
  }
};
