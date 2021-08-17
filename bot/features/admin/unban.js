const db = require("./../../../service/database");

module.exports = {
  data: {
    name: "Unban Command",
    description: "Fitur buat unban orang",
    usage: "[@bot/!] unban [user/pap] <query>",
    ADMIN: true,
    CMD: "unban",
    ALIASES: []
  },
  run: (parsed, event, bot) => {
    let msg = parsed.arg.split(" ");
    var type = msg[0];
    var out = "";
    let msg3 = msg.splice(1, msg.length).join(" ");
    if (type == "user") {
      var bandb = db.open("db/ban.json");
      out = "User ";
      var db2 = db.open("db/user.json");
      var userid = "";
      for (var i = 0; i < Object.keys(db2.get()).length; i++) {
        if (db2.get(Object.keys(db2.get())[i] + ".key").toLowerCase() == msg3) {
          userid = Object.keys(db2.get())[i];
          break;
        }
      }
      if (userid == "") {
        return {
          type: "text",
          text: "Pengguna tidak ditemukan."
        };
      }
    } else if (type == "pap") {
      var bandb = db.open("features/banpap.json");
      out = "Kata pap ";
    }
    bandb.set(type == "user" ? userid : msg3.toLowerCase(), 0);
    bandb.save();
    return {
      type: "text",
      text:
        out +
        (type == "user" ? db2.get(userid).name : msg3) +
        " telah di-unban oleh Admin"
    };
  }
};
