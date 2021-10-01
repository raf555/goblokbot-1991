const db = require("@utils/database");
const { cekban } = require("@bot/utility");

module.exports = {
  data: {
    name: "Ban Command",
    description: "Command buat ban pap / orang",
    usage: "[@bot/!] ban [user/pap] <query>",
    ADMIN: true,
    CMD: "ban",
    ALIASES: []
  },
  run: ban
};

function ban_new(parsed, event, bot) {
  if (!event.message.mention) {
    return {
      type: "text",
      text: "Invalid syntax"
    };
  }
  let msg = parsed.args.msg;
  let bandb = db.open("db/ban.json");
  let udb = db.open("db/user.json");
  let banhistory = db.open("db/banhistory.json");
  let { mentionees } = event.message.mention;
  let t = gettime(parsed.arg);
  let banned = [];
  let iz;
  let now = Date.now();

  mentionees.forEach(mentionee => {
    let id = gethashidfromid(mentionee.userId, udb.get());
    if (!id) return;
    let cb = cekban(id);
    let p = (cb[0] ? cb[2] : now) + t;
    bandb.set(id, p);
    banned.push(udb.get(id).name);
    iz = id;
    banhistory.set((Object.keys(banhistory.get()).length + 1).toString(), {
      timestamp: now,
      message: msg || "",
      penalty: t,
      id: mentionee.userId,
      by: event.source.userId
    });
  });

  bandb.save();
  banhistory.save();

  return {
    type: "text",
    text: banned.join(", ") + " telah di-ban sampai " + cekban(iz)[1]
  };
}

function gethashidfromid(id, data) {
  let a = Object.keys(data);
  let b = Object.values(data);
  let i = b.findIndex(d => d.id === id);
  if (i === -1) {
    return null;
  }
  return a[i];
}

function gettime(text) {
  let msg = text.split(" ");
  let ind = msg.pop();
  let time = msg.pop();
  let dur = 0;

  if (ind === "jam") {
    dur = parseInt(time) * 3600000;
  } else if (ind === "menit") {
    dur = parseInt(time) * 60000;
  } else if (ind === "detik") {
    dur = parseInt(time) * 1000;
  } else {
    dur = 10 * 60000;
  }

  return dur;
}

function ban(parsed, event, bot) {
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
  } else {
    return ban_new(parsed, event, bot);
  }
}
