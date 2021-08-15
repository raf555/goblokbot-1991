const db = require("./../../../service/database");

module.exports = {
  data: {
    name: "Turn command",
    description: "Command buat matiin bot/fitur",
    usage: "[@bot/!] turn [bot/*] [off/on]",
    createdAt: 0,
    CMD: "turn",
    ALIASES: []
  },
  run: (parsed, event, bot) => {
    let msg = parsed.arg.split(" ");
    //let msg3 = msg.splice(1, msg.length).join(" ");
    let state = db.open("bot/setting.json");

    if (msg[0]) {
      if (msg[0] == "bot") {
        if (msg[1] == "off") {
          state.set("bot", 0);
          state.save();
          return {
            type: "text",
            text: "Bot telah dimatikan"
          };
        } else if (msg[1] == "on") {
          state.set("bot", 1);
          state.save();
          return {
            type: "text",
            text: "Bot telah diaktifkan"
          };
        }
      } else {
        if (msg.length < 2) {
          return {
            type: "text",
            text: "Invalid"
          };
        }
        let opt = msg[msg.length - 1];
        let thecmd = "";
        for (let i in msg) {
          if (i < msg.length - 1) {
            if (i < msg.length - 2) {
              thecmd += msg[i] + " ";
            } else {
              thecmd += msg[i];
            }
          }
        }
        var cmddb = db.open("db/customcmd.json");
        var db3 = require("./../.")(true);
        db3 = Object.keys(db3.mustcall).concat(Object.keys(db3.mustntcall));
        if (!cmddb.get(thecmd)) {
          if (db3.includes(thecmd)) {
            if (opt == "off") {
              state.set("disabledftr." + thecmd, 1);
              state.save();
              return {
                type: "text",
                text: "Fitur " + thecmd + " telah dimatikan"
              };
            } else if (opt == "on") {
              state.set("disabledftr." + thecmd, 0);
              state.save();
              return {
                type: "text",
                text: "Fitur " + thecmd + " telah diaktifkan"
              };
            }
          } else {
            return {
              type: "text",
              text: "Invalid"
            };
          }
        } else {
          if (opt == "off") {
            cmddb.set(thecmd + ".approved", 0);
            cmddb.save();
            return {
              type: "text",
              text: "Fitur " + thecmd + " telah dimatikan"
            };
          } else if (opt == "on") {
            cmddb.set(thecmd + ".approved", 1);
            cmddb.save();
            return {
              type: "text",
              text: "Fitur " + thecmd + " telah diaktifkan"
            };
          }
        }
      }
    }
  }
};
