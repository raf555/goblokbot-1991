const db = require("./../../../service/database");
const { cekban } = require("./../../utility");

module.exports = {
  data: {
    name: "Ban Command",
    description: "Command buat ban pap / orang",
    help: "",
    createdAt: 0,
    CMD: "ban",
    ALIASES: []
  },
  run: (parsed, event) => {
    let msg = parsed.arg.split(" ");
    var type = msg[0];
    if (type == "user") {
      var dur = 0;
      if (msg[msg.length - 1] == "jam") {
        dur += Date.now() + parseInt(msg[msg.length - 2]) * 3600000;
        msg.pop();
        msg.pop();
      } else if (msg[msg.length - 1] == "menit") {
        dur += Date.now() + parseInt(msg[msg.length - 2]) * 60000;
        msg.pop();
        msg.pop();
      } else if (msg[msg.length - 1] == "detik") {
        dur += Date.now() + parseInt(msg[msg.length - 2]) * 1000;
        msg.pop();
        msg.pop();
      } else {
        dur += Date.now() + 10 * 60000;
      }
      var bandb = db.open("db/ban.json");
      var db2 = db.open("db/user.json");
      var userid = "";
      let msg3 = msg.splice(1, msg.length).join(" ");
      for (var i = 0; i < Object.keys(db2.get()).length; i++) {
        if (db2.get(Object.keys(db2.get())[i] + ".key") == msg3) {
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
      bandb.set(userid, dur);
      bandb.save();
      return {
        type: "text",
        text: msg3 + " telah di-ban sampai " + cekban(userid)[1]
      };
    } else if (type == "pap") {
      var dbpap = db.open("db/banpap.json");
      let msg3 = msg.splice(1, msg.length).join(" ");
      dbpap.set(msg3.toLowerCase(), 1);
      dbpap.save();
      return {
        type: "text",
        text: "Kata 「 " + msg3 + " 」 telah di-ban oleh Admin"
      };
    }
  }
};
