// const stringSimilarity = require("string-similarity");
const featuredb = require("./features")();
const db = require("./../service/database");
const { cekban, isAdmin } = require("./utility");
const {
  parse,
  buildFromParsed,
  buildArgs,
  removeParserArgs,
  restoreParserArgs
} = require("./parser");

module.exports = {
  exec: execMessage,
  execMultiple: execMulti
};

let ccc = {};

let setting = db.open("bot/setting.json").get();
const keywords = Object.keys(featuredb.mustcall);
const keywords2 = Object.keys(featuredb.mustntcall);

function execMulti(text, event) {
  setting = db.open("bot/setting.json").get();
  let split = text.split(" ; ");

  let buildcaller = constructcaller();
  let cmdreg = "(\\w+[-\\w]*)";

  let oh = [];
  for (let i = 0; i < split.length; i++) {
    let split2 = split[i].split(/\s?;;\s?/);
    let word = new RegExp(
      `${buildcaller.normal}\\s(${cmdreg}|!)|^${buildcaller.shortcut}(${cmdreg}|!)|${cmdreg}`
    ).exec(split[i])[0];
    split2 = split2.join(` ; ${word} `).split(" ; ");
    oh = oh.concat(split2);
  }

  split = oh;

  if (split.length === 1) {
    return execMessage(text, event);
  }

  if (split.length > 5) {
    return Promise.resolve(null);
  }

  let executedpromise = split.map(text =>
    execMessage(text, event)
      .then(reply => reply)
      .catch(e => {
        console.error(e);
        let out = `Command Error -> ${text} \n\nError: ${e.name} - ${e.message}`;
        return { type: "text", text: out };
      })
  );

  return Promise.all(executedpromise).then(res => {
    let executed = [];
    let nullc = 0;

    res.forEach((reply, i) => {
      if (reply) {
        if (!Array.isArray(reply)) {
          reply = [reply];
        }
      } else {
        nullc++;
        reply = [
          {
            type: "text",
            text: `Command (${split[i]}) was skipped because of no reply`
          }
        ];
      }
      executed.push(reply);
    });
    return executed.length === 0 || nullc === executed.length
      ? null
      : [].concat.apply([], executed).slice(0, 5);
  });
}

async function execMessage(text, event) {
  //const setting = db.open("bot/setting.json").get();
  let parsed = parse(text, setting.caller);
  let removed = removeParserArgs(parsed); // remove reserved args

  let customkeywords = Object.keys(db.open("db/customcmd.json").get());

  let cmd = parsed.command;
  let cleanedcmd = (
    parsed.command + (parsed.arg ? " " + parsed.arg : "")
  ).toLowerCase();

  /* message valid to send check */
  let checkstatus = validToSend(parsed, event, setting);
  let checkcond =
    keywords.includes(cmd) ||
    customkeywords.includes(cleanedcmd) ||
    keywords2.includes(cmd);

  if ((checkstatus || checkstatus === 0) && (parsed.called || checkcond)) {
    if (checkstatus === 0) {
      return null;
    }
    return await Promise.resolve(checkstatus);
  }

  /* proceed the command */
  let reply = null;
  if (parsed.called) {
    if (ccc[event.source.groupId || event.source.userId]) {
      ccc[event.source.groupId || event.source.userId] = 0;
    }
    if (cmd === "!") {
      // special case
      parsed = restoreParserArgs(parsed, removed);

      reply = await Promise.resolve(lastcmd(parsed, event));
      if (reply) {
        if (Array.isArray(reply)) {
          parsed = reply[0].parsed;
        } else {
          parsed = reply.parsed;
        }
      }
    } else {
      if (keywords.includes(cmd)) {
        reply = await Promise.resolve(featuredb.mustcall[cmd](parsed, event));
      } else {
        if (!parsed.shortcut && !parsed.arg && !cmd) {
          reply = greeting(event);
        }
      }
    }
  } else {
    if (ccc[event.source.groupId || event.source.userId]) {
      ccc[event.source.groupId || event.source.userId] = 0;
      if (keywords.includes(cmd)) {
        reply = await Promise.resolve(featuredb.mustcall[cmd](parsed, event));
      } else {
        if (cmd === "gapapa" || cmd === "gpp" || cmd === "gajadi") {
          reply = { type: "text", text: "oke" };
        }
      }
    } else {
      if (keywords2.includes(cmd)) {
        reply = await Promise.resolve(featuredb.mustntcall[cmd](parsed, event));
      } else {
        if (customkeywords.includes(cleanedcmd)) {
          reply = customfeature(cleanedcmd, event);
          if (reply) {
            reply.cmd = cleanedcmd;
            reply.cmdtype = "other";
          }
        } else {
          reply = regexbasedfeature(text, event);
          if (reply) {
            reply.cmdtype = "other";
          }
        }
      }
    }
  }

  // restore reserved args
  parsed = restoreParserArgs(parsed, removed);

  if (reply) {
    if (!Array.isArray(reply)) {
      if (!reply.cmd && reply.cmd !== "") {
        reply.cmd = cmd;
      }
      reply.parsed = parsed;
    } else {
      reply = reply.map(rdata => {
        let out = {};
        if (!rdata.cmd && rdata.cmd !== "") {
          out.cmd = cmd;
        }
        out.parsed = parsed;
        return Object.assign(rdata, out);
      });
    }
  }

  return reply;
}

function constructcaller() {
  let normal = [setting.caller.normal].concat(
    Object.keys(setting.caller.custom.normal).filter(
      key => setting.caller.custom.normal[key] !== 0
    )
  );

  let shortcut = [setting.caller.shortcut].concat(
    Object.keys(setting.caller.custom.shortcut).filter(
      key => setting.caller.custom.shortcut[key] !== 0
    )
  );

  return {
    normal: `(${normal.join("|")})`,
    shortcut: `(${shortcut.join("|")})`
  };
}

function lastcmd(parsed, event) {
  let cmdhist = Object.values(db.open("db/cmdhistory.json").get());

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

function validToSend(parsed, event, setting) {
  let cmd = parsed.command;

  if (cmd === "status") {
    return featuredb.mustcall["status"]();
  }

  if (!setting.bot) {
    if (!isAdmin(event.source.userId)) {
      if (!setting.statemsg) {
        return 0;
      }
      return {
        type: "text",
        text: "Bot sedang dalam kondisi luring."
      };
    }
  }

  let bancheck = cekban(event.source.userId, false);
  if (bancheck[0]) {
    if (!isAdmin(event.source.userId)) {
      if (!setting.statemsg) {
        return 0;
      }
      return {
        type: "text",
        text: "Anda telah di-ban oleh admin sampai " + bancheck[1]
      };
    }
  }

  if (setting.disabledftr[cmd]) {
    if (!isAdmin(event.source.userId)) {
      if (!setting.statemsg) {
        return 0;
      }
      return {
        type: "text",
        text: "Fitur " + cmd + " dalam kondisi nonaktif"
      };
    }
  }

  return null;
}

function greeting(event) {
  ccc[event.source.groupId || event.source.userId] = 1;
  return {
    type: "text",
    text: isAdmin(event.source.userId) ? "kenaps" : "apaan",
    quickReply: db.open(`bot/assets/qr.json`).get()
  };
}

function regexbasedfeature(text, event) {
  let msg = text;

  if (
    msg.length > 4 &&
    msg.match(/(a)\1\1\1\1+/i) /* msg.match(/^(a)\1*$/i) */
  ) {
    let gblk = db.open(`bot/assets/hacama.json`);
    return Object.assign(gblk.get(), { cmd: "aaaaa" });
  }

  if (
    msg[0].toLowerCase() == "g" &&
    msg.length > 2 &&
    msg.match(/(r)\1\1+/i) /* msg.match(/^(a)\1*$/i) */
  ) {
    return {
      type: "image",
      originalContentUrl: "https://i.ibb.co/jbTKmQc/grr.jpg", //"https://i.ibb.co/ChLFsXr/184101.jpg",
      previewImageUrl: "https://i.ibb.co/jbTKmQc/grr.jpg",
      cmd: "grr"
    };
  }
}

function customfeature(msg, event) {
  let custcmd = db.open("db/customcmd.json");
  if (custcmd.get(msg)) {
    if (isAdmin(event.source.userId) || custcmd.get(msg).approved == 1) {
      let rep;

      switch (custcmd.get(msg).type) {
        case "text":
          rep = { type: "text", text: custcmd.get(msg).reply };
          break;
        case "image":
          rep = {
            type: "image",
            originalContentUrl: custcmd.get(msg).reply,
            previewImageUrl: custcmd.get(msg).reply
          };
          break;
        case "flex":
          rep = {
            type: "flex",
            contents: JSON.parse(custcmd.get(msg).reply),
            altText: msg
          };
          break;
        default:
          rep = null;
      }

      if (rep) {
        if (custcmd.get(msg + ".sender.name")) {
          rep.sender = {};
          rep.sender.name = custcmd.get(msg + ".sender.name");
          if (custcmd.get(msg + ".sender.img")) {
            rep.sender.iconUrl = custcmd.get(msg + ".sender.img");
          }
        }
        return rep;
      }
    }
  }
  return null;
}
