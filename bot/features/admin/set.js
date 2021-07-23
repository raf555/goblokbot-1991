const db = require("./../../../service/database");

module.exports = {
  data: {
    name: "Set Command",
    description: "Fitur untuk set variabel bot",
    help: "",
    createdAt: 0,
    CMD: "set",
    ALIASES: []
  },
  run: (parsed, event) => {
    let msg = parsed.arg.split(" ");
    var type = msg[0];
    let choice = msg[1];
    let settingdb = db.open("bot/setting.json");
    if (type == "imgapi") {
      settingdb.set("imgapi", parseInt(choice));
    } else if (type == "caller") {
      settingdb.set("caller.custom.normal." + choice.toLowerCase(), 1);
    } else if (type == "statemsg") {
      settingdb.set("statemsg", choice.toLowerCase() === "on" ? 1 : 0);
    } else if (type == "history_message") {
      settingdb.set(
        "saveMessage.message",
        choice.toLowerCase() === "on" ? 1 : 0
      );
    } else if (type == "history_image") {
      settingdb.set("saveMessage.image", choice.toLowerCase() === "on" ? 1 : 0);
    } else {
      return { type: "text", text: "invalid" };
    }
    settingdb.save();
    return { type: "text", text: "ok" };
  }
};
