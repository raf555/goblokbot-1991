const db = require("./../../../service/database");
const { buildArgs, buildFromParsed } = require("./../../parser");

module.exports = {
  data: {
    name: "Call Last Called CMD",
    description: "Command buat nmanggil command terakhir",
    usage: "[@bot/!] [!/lastcmd]",
    CMD: "lastcmd",
    ALIASES: []
  },
  run: lastcmd
};

function lastcmd(parsed, event, bot) {
  let cmdhist = Object.values(db.open("db/cmdhistory.json").get());
  let { exec: execMessage } = bot.function;

  if (event.source.groupId) {
    cmdhist = cmdhist.filter(data => !!data.fromGroup);
  } else {
    cmdhist = cmdhist.filter(
      data => !data.fromGroup && data.id === event.source.userId
    );
  }

  if (cmdhist.length === 0) {
    return null;
  }

  let last = cmdhist.length - 1;

  if (parsed.args.cmd || parsed.args.info) {
    delete parsed.args.cmd;
    delete parsed.args.info;
    return {
      type: "text",
      text: cmdhist[last].fullMsg
    };
  }

  if (parsed.args.if) {
    let iff = parsed.args.if.toLowerCase();
    delete parsed.args.if;
    if (cmdhist[last].command !== iff) {
      return {
        type: "text",
        text: "Last cmd: " + cmdhist[last].command
      };
    }
  }

  let out;

  if (parsed.args.all) {
    delete parsed.args.all;
    parsed.args.arg = true;
    parsed.args.args = true;
  }

  if (cmdhist[last].isothercmd) {
    out = cmdhist[last].fullMsg;
    if (parsed.args.arg) {
      out += " " + cmdhist[last].arg;
    }
    if (parsed.args.args) {
      out += " " + buildArgs(cmdhist[last]);
    }

    delete parsed.args.arg;
    delete parsed.args.args;
  } else {
    let lastcmd = buildFromParsed(cmdhist[last], true);

    let lastarg = "";
    let lastargs = "";

    if (parsed.args.arg) {
      lastarg = cmdhist[last].arg;
    }
    if (parsed.args.args) {
      lastargs = buildArgs(cmdhist[last]);
    }

    delete parsed.args.arg;
    delete parsed.args.args;

    let currargs = buildArgs(parsed);

    out = `${lastcmd}${currargs}${lastargs} ${lastarg} ${parsed.arg}`;
  }

  return execMessage(out, event);
}
