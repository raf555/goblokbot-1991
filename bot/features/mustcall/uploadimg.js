const imgbb = require("@utils/imgbb");
const db = require("@utils/database");

module.exports = {
  data: {
    name: "Upload IMG",
    description: "Command buat nambah queue buat upload gambar ke IMGBB",
    usage:
      "[@bot/!] uploadimg {options}" +
      "\n\noptions:" +
      "\n-name <name> ?: nama gambar" +
      "\n-exp <t> ?: kedaluwarsa gambar dalam detik" +
      "\n--jimp ?: buat id jimp",
    CMD: "uploadimg",
    ALIASES: []
  },
  run: (parsed, event, bot) => {
    let name = parsed.args.n || parsed.args.name || null;
    let exp = parsed.args.e || parsed.args.exp || null;
    let jimp = parsed.args.jimp ? true : false;

    if (exp) {
      if (!isNaN(exp)) {
        exp = parseInt(exp);
        if (exp < 60) {
          return { type: "text", text: "Minimum 1 minutes (60 sec)" };
        }
      } else {
        if (exp.toLowerCase() !== "inf") {
          return { type: "text", text: "Invalid exp" };
        }
        exp = null;
      }
    } else {
      exp = 24 * 3600;
    }

    let uploaddb = db.open("db/uploadimgq.json");

    uploaddb.set(event.source.userId, {
      name: name || event.message.id,
      exp: exp,
      expire: Date.now() + 30000,
      uploaded: false,
      jimp: jimp
    });
    uploaddb.save();

    return { type: "text", text: "Waiting for image (30s)" };
  }
};
