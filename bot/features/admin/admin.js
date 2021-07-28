const db = require("./../../../service/database");
const { hash } = require("./../../utility");

module.exports = {
  data: {
    name: "Admin Command",
    description: "Fitur utk jadiin orang admin",
    help: "",
    createdAt: 0,
    CMD: "admin",
    ALIASES: []
  },
  run: (parsed, event, bot) => {
    let msg = parsed.arg.split(" ");
    let msg3 = msg.splice(1, msg.length).join(" ");
    if (msg[0]) {
      if (msg[0] == "set") {
        var db2 = db.open("db/user.json");
        var userid = "";
        for (var i = 0; i < Object.keys(db2.get()).length; i++) {
          if (
            db2.get(Object.keys(db2.get())[i] + ".key").toLowerCase() == msg3
          ) {
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
        var dbadmin = db.open("db/admin.json");
        dbadmin.set(userid, 1);
        dbadmin.save();
        return {
          type: "text",
          text: "Pengguna " + db2.get(userid).name + " telah dijadikan Admin."
        };
      } else if (msg[0] == "unset") {
        var db2 = db.open("db/user.json");
        var userid = "";
        for (var i = 0; i < Object.keys(db2.get()).length; i++) {
          if (
            db2.get(Object.keys(db2.get())[i] + ".key").toLowerCase() == msg3
          ) {
            userid = Object.keys(db2.get())[i];
            break;
          }
        }
        if (userid == "" || userid == hash(process.env.admin_id)) {
          return {
            type: "text",
            text: "Pengguna tidak ditemukan."
          };
        }
        var dbadmin = db.open("db/admin.json");
        dbadmin.set(userid, 0);
        dbadmin.save();
        return {
          type: "text",
          text:
            "Pengguna " +
            db2.get(userid).name +
            " telah dijadikan Member biasa."
        };
      }
    }
  }
};
