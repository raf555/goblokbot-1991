const db = require("@utils/database");
const { addSocialCredit, getscdata } = require("@bot/socialcredit");
const { gethashidfromuid, gethashidfromkey } = require("@bot/utility");

module.exports = {
  data: {
    name: "Give Social Credit Command",
    description: "Command buat ngasih social credit",
    usage: "[@bot/!] givesc [user/@mention] <amount>",
    ADMIN: true,
    CMD: "givesc",
    ALIASES: []
  },
  run: givesc
};

function givesc(parsed, event, bot) {
  let udb = db.open("db/user.json");
  let iz;
  let users = [];
  let amo = parsed.arg.split(" ").pop();
  let amount = isNaN(amo) ? 0 : parseInt(amo);
  let out = [];
  let set = parsed.args.set;

  let all = parsed.arg.split(" ")[0].toLowerCase() === "all";
  if (all) {
    event.message.mention = {
      mentionees: Object.values(udb.get())
        .filter(d => d.key !== "null")
        .map(d => ({ userId: d.id }))
    };
  }

  if (!event.message.mention) {
    let key = parsed.arg.split(" ")[0];
    let hash = gethashidfromkey(key, udb.get());
    let id = udb.get(hash).id;
    let scdata = getscdata(id);
    if (scdata) {
      users.push(udb.get(hash).name || "NONAME");
      iz = id;
      let na = set ? -1 * scdata.xp + amount : amount;
      let sc = addSocialCredit(udb.get(hash).id, na);
      if (sc && sc.levelchange) out.push(sc.messageobj);
    }
  } else {
    let { mentionees } = event.message.mention;
    mentionees.forEach(mentionee => {
      let id = mentionee.userId;
      let hash = gethashidfromuid(id, udb.get());
      let scdata = getscdata(id);
      if (scdata) {
        users.push(udb.get(hash).name || "NONAME");
        iz = id;
        let na = set ? -1 * scdata.xp + amount : amount;
        let sc = addSocialCredit(udb.get(hash).id, na);
        if (sc && sc.levelchange) out.push(sc.messageobj);
      }
    });
  }

  if (!iz) {
    return {
      type: "text",
      text: "Key not found / invalid syntax"
    };
  }

  let t;
  if (all) {
    t =
      "Semua telah diberikan " +
      amount.toLocaleString("id-ID") +
      " social credit";
  } else {
    t =
      users.join(", ") +
      " telah diberikan " +
      amount.toLocaleString("id-ID") +
      " social credit";
  }

  out = out.slice(0, 4);
  out.unshift({
    type: "text",
    text: t
  });

  return all ? out[0] : out;
}
