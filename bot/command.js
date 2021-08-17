// const stringSimilarity = require("string-similarity");
const db = require("./../service/database");
const { cekban, isAdmin, getContentFromEvent } = require("./utility");
const {
  parse,
  buildFromParsed,
  buildArgs,
  removeParserArgs,
  restoreParserArgs
} = require("./parser");
const regexbasedfeature = require("./features/regex");

module.exports = {
  exec: execMessage,
  execMultiple: execMulti,
  execImage: executeImage
};

let ccc = {};

const bot = require("./features")();
Object.assign(bot, { function: module.exports }); // assign execute functions

let setting = db.open("bot/setting.json").get();
const keywords = Object.keys(bot.mustcall);
const keywords2 = Object.keys(bot.mustntcall);

function execMulti(text, event) {
  setting = db.open("bot/setting.json").get();
  let split = text.split(" ; ");

  let buildcaller = constructcaller();
  let cmdreg = "(\\w+[-\\w]*)";

  let oh = [];
  for (let i = 0; i < split.length; i++) {
    let split2 = split[i].split(/\s?;;\s?/);
    let word = new RegExp(
      `${buildcaller.normal}\\s(${cmdreg}|!)|^${buildcaller.shortcut}\\s?(${cmdreg}|!)|${cmdreg}`
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
        let out = `Command Error -> ${text} \n\n${e.name}: ${e.message}`;
        return { type: "text", text: out, nosave: true, latency: 1 };
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
  let starttime = Date.now();

  //const setting = db.open("bot/setting.json").get();
  let parsed = parse(text, setting.caller);
  let removed = removeParserArgs(parsed); // remove reserved args

  let customkeywords = Object.keys(db.open("db/customcmd.json").get());

  let cmd = parsed.command;
  let cleanedcmd = (
    parsed.command + (parsed.arg ? " " + parsed.arg : "")
  ).toLowerCase();

  /* message valid to send check */
  let checkstatus = await executeCommand(validToSend, parsed, event);
  let checkcond =
    keywords.includes(cmd) ||
    customkeywords.includes(cleanedcmd) ||
    keywords2.includes(cmd);

  if ((checkstatus || checkstatus === 0) && (parsed.called || checkcond)) {
    if (checkstatus === 0) {
      return null;
    }
    return checkstatus;
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

      reply = await executeCommand(bot.mustcall["lastcmd"], parsed, event, bot);
      if (reply) {
        if (Array.isArray(reply)) {
          parsed = reply[0].parsed;
        } else {
          parsed = reply.parsed;
        }
      }
    } else {
      if (keywords.includes(cmd)) {
        reply = await executeCommand(bot.mustcall[cmd], parsed, event, bot);
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
        reply = await executeCommand(bot.mustcall[cmd], parsed, event, bot);
      } else {
        if (cmd === "gapapa" || cmd === "gpp" || cmd === "gajadi") {
          reply = { type: "text", text: "oke" };
        }
      }
    } else {
      if (keywords2.includes(cmd)) {
        reply = await executeCommand(bot.mustntcall[cmd], parsed, event, bot);
      } else {
        if (customkeywords.includes(cleanedcmd)) {
          reply = customfeature(cleanedcmd, event);
          if (reply) {
            reply.cmd = cleanedcmd;
            reply.cmdtype = "other";
          }
        } else {
          reply = await executeCommand(regexbasedfeature, parsed, event, bot);
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
      reply.realtime = Date.now() - starttime;
      if (!reply.parsed) reply.parsed = parsed;
    } else {
      reply = reply.map(rdata => {
        let out = {};
        if (!rdata.cmd && rdata.cmd !== "") {
          out.cmd = cmd;
        }
        out.realtime = Date.now() - starttime;
        if (!rdata.parsed) out.parsed = parsed;
        return Object.assign(rdata, out);
      });
    }

    return Array.isArray(reply) ? reply : [reply];
  }

  return null;
}

function executeCommand() {
  const TO = setting.timeout; // timeout in seconds

  let cmdfunc = arguments[0];
  let parsed, event, bot;

  if (arguments.length > 1 && arguments.length < 5) {
    parsed = arguments[1];
    event = arguments[2];
    bot = arguments[3];
  }

  const timeout = new Promise((_, reject) => {
    setTimeout(reject, TO * 1000, new Error("cmd:timeout"));
  });

  const cmdpromise = new Promise(async (resolve, reject) => {
    try {
      resolve(await Promise.resolve(cmdfunc(parsed, event, bot)));
    } catch (e) {
      reject(e);
    }
  });

  return Promise.race([cmdpromise, timeout]).catch(e => {
    if (e.message === "cmd:timeout") {
      let msg;
      if (parsed) {
        msg = parsed.fullMsg;
      }
      throw new Error(
        `[${msg}] was cancelled because the timeout (${TO}s) was exceeded.`
      );
    }
    throw e;
  });
}

function executeImage(event) {
  // to be added more later if I wanted to

  return null;
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

function validToSend(parsed, event) {
  let cmd = parsed.command;

  if (cmd === "status") {
    return bot.mustcall["status"]();
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
