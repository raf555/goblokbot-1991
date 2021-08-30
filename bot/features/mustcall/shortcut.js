const db = require("@utils/database");

module.exports = {
  data: {
    name: "Shortcut cmd register",
    description: "Command buat bikin shortcut cmd biar ez",
    usage:
      "[@bot/!] s <id>? {options}!" +
      "\n\noptions:" +
      "\n-reg <name> !: command buat didaftarin" +
      "\n-id <id> ?: nama shortcut" +
      "\n-unreg <id> ?: buat unreg",
    CMD: "shortcut",
    ALIASES: ["s"]
  },
  run: shortcut
};

function shortcut(parsed, event, bot) {
  let reg = parsed.args.reg;
  let id = parsed.arg;
  let info = parsed.args.info;
  let unreg = parsed.args.unreg;

  let { userId } = event.source;

  if (info) {
    return infocmd(userId, info);
  }

  if (unreg) {
    return unregister(unreg, userId);
  }

  if (reg) {
    return register(reg, id, userId);
  }

  return execute(id, userId, event, parsed.args, bot.function.execMultiple);
}

function infocmd(uid, info) {
  let sdb = db.open("db/shortcutcmd.json");

  let q = uid;

  if (info && typeof info === "string") {
    q += "." + info;
  }

  let cmd = sdb.get(q);

  return {
    type: "text",
    text: cmd ? JSON.stringify(cmd, null, 1) : "{}"
  };
}

function register(cmd, id, uid) {
  let sdb = db.open("db/shortcutcmd.json");
  id = id.toString();

  let key = !id ? "default" : id;

  if (!cmd) {
    return {
      type: "text",
      text: "Invalid cmd"
    };
  }

  sdb.set(uid + "." + key, cmd);
  sdb.save();

  return {
    type: "text",
    text: "Command [" + cmd + "] is registered as [" + key + "]"
  };
}

function unregister(id, uid) {
  let sdb = db.open("db/shortcutcmd.json");
  id = id.toString();

  let key = !id ? "default" : id;

  if (!sdb.get(uid + "." + key)) {
    return {
      type: "text",
      text: "Invalid id"
    };
  }

  let cmd = sdb.get(uid + "." + key);

  sdb.unset(uid + "." + key);
  sdb.save();

  return {
    type: "text",
    text: "Command [" + cmd + "] is unregistered"
  };
}

function execute(id, uid, event, args, exec) {
  let sdb = db.open("db/shortcutcmd.json");

  let key = !id ? "default" : id;

  let cmd = sdb.get(uid + "." + key);
  if (!cmd) {
    return {
      type: "text",
      text: "Shortcut for id [" + key + "] is not found"
    };
  }

  let vars = cmd.match(/{(\w+)}/g);
  if (vars) {
    vars.forEach(q => {
      let name = /{(\w+)}/.exec(q)[1];
      let val = args[name];
      if (val) {
        cmd = cmd.replace(new RegExp(q, "g"), val);
      }
    });
  }

  //return Promise.resolve(
  return exec(cmd, event)
    .then(res => {
      if (!res) {
        return [
          {
            type: "text",
            text: "Command [" + cmd + "] returned nothing"
          }
        ];
      }

      return res;
    })
    .catch(e => {
      console.error(e);
      return [
        {
          type: "text",
          text: "Command [" + cmd + "] returned an error\n\nError: " + e.message
        }
      ];
    });
  //).then(res => res.map(r => Object.assign(r, { nosave: true })));
}
