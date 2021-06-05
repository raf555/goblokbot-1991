const imgbb = require("./../../../service/imgbb");
const db = require("./../../../service/database");

module.exports = (parsed, event) => {
  let name = parsed.args.n || parsed.args.name || null;
  let exp = parsed.args.e || parsed.args.exp || null;
  if (exp) {
    if (!isNaN(exp)) {
      exp = parseInt(exp);
      if (exp < 600) {
        return { type: "text", text: "Minimum 10 minutes (600 sec)" };
      }
    } else {
      return { type: "text", text: "Invalid exp" };
    }
  }

  let uploaddb = db.open("db/uploadimgq.json");

  uploaddb.set(event.source.userId, {
    name: name || event.message.id,
    exp: exp,
    expire: Date.now() + 30000,
    uploaded: false
  });
  uploaddb.save();

  return { type: "text", text: "Waiting for image (30s)" };
};
