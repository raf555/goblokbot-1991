const imgbb = require("./../../../service/imgbb");
const db = require("./../../../service/database");

module.exports = (parsed, event) => {
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
      return { type: "text", text: "Invalid exp" };
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
};
