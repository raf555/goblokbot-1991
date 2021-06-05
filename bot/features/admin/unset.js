const db = require("./../../../service/database");

module.exports = (parsed, event) => {
  let msg = parsed.arg.split(" ");
  var type = msg[0];
  let choice = msg[1];
  let settingdb = db.open("bot/setting.json");
  if (type == "caller") {
    settingdb.set("caller.custom.normal." + choice.toLowerCase(), 0);
  } else {
    return { type: "text", text: "invalid" };
  }
  settingdb.save();
  return { type: "text", text: "ok" };
};
