const db = require("./../../../service/database");

module.exports = {
  data: {
    name: "Shortcut cmd register",
    description: "Command buat bikin shortcut cmd biar ez",
    help: "",
    createdAt: 0,
    CMD: "shortcut",
    ALIASES: ["s"]
  },
  run: shortcut
};

function shortcut(parsed, event, bot) {
  let reg = parsed.args.reg;
  let id = parsed.args.as || parsed.args.id || parsed.arg;
  let info = parsed.args.info;
  let unreg = parsed.args.unreg;

  delete parsed.args.reg;
  delete parsed.args.id;
  delete parsed.args.info;
  delete parsed.args.unreg;

  let { userId } = event.source;

  if (info) {
    return infocmd(id, userId);
  }

  if (unreg) {
    return unregister(id, userId);
  }

  if (reg) {
    return register(reg, id, userId);
  }

  if (Object.keys(parsed.args).length === 0) {
    return execute(id, userId, event, bot.function.execMultiple);
  }

  return null;
}

function infocmd(id, uid) {
  let sdb = db.open("db/shortcutcmd.json");

  let key = !id ? "default" : id;

  let cmd = sdb.get(uid + "." + key);
  if (!cmd) {
    return {
      type: "text",
      text: "Shortcut for id [" + key + "] is not found"
    };
  }

  return {
    type: "text",
    text: cmd
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

function execute(id, uid, event, exec) {
  let sdb = db.open("db/shortcutcmd.json");

  let key = !id ? "default" : id;

  let cmd = sdb.get(uid + "." + key);
  if (!cmd) {
    return {
      type: "text",
      text: "Shortcut for id [" + key + "] is not found"
    };
  }

  return exec(cmd, event);
}
