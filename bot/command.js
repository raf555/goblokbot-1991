const { parse } = require("./parser");
const featuredb = require("./features")();
const db = require("./../service/database");
const { cekban, isAdmin } = require("./utility");

module.exports = {
  exec: execMessage
};

let ccc = 0;

const keywords = Object.keys(featuredb.mustcall);
const customkeywords2 = Object.keys(featuredb.mustntcall);

async function execMessage(text, event) {
  const setting = db.open("bot/setting.json").get();
  const parsed = parse(text, setting.caller);

  let customkeywords = Object.keys(db.open("db/customcmd.json").get());

  let cmd = parsed.command;

  let checkstatus = validToSend(cmd, event, setting);
  let checkcond =
    keywords.includes(cmd) ||
    customkeywords.includes(text) ||
    customkeywords2.includes(cmd);

  if (checkstatus && (parsed.called || checkcond)) {
    return await Promise.resolve(checkstatus);
  }

  let reply = null;
  if (parsed.called) {
    if (ccc) {
      ccc = 0;
    }
    if (keywords.includes(cmd)) {
      reply = await Promise.resolve(featuredb.mustcall[cmd](parsed, event));
    } else {
      if (!parsed.shortcut && !parsed.arg && !cmd) {
        reply = greeting(event);
      }
    }
  } else {
    if (ccc) {
      ccc = 0;
      if (keywords.includes(cmd)) {
        reply = await Promise.resolve(featuredb.mustcall[cmd](parsed, event));
      } else {
        if (cmd === "gapapa" || cmd === "gpp" || cmd === "gajadi") {
          reply = { type: "text", text: "oke" };
        }
      }
    } else {
      if (customkeywords2.includes(cmd)) {
        reply = await Promise.resolve(featuredb.mustntcall[cmd](parsed, event));
      } else {
        let cleanedarg = removeArgFromMsg(text, parsed.args).toLowerCase();
        if (customkeywords.includes(cleanedarg)) {
          reply = customfeature(cleanedarg);
        } else {
          reply = regexbasedfeature(text);
        }
      }
    }
  }

  if (reply) {
    if (!Object.keys(reply).includes("cmd")) {
      reply.cmd = cmd;
    }
    reply.parsed = parsed;
  }

  return reply;
}

function validToSend(cmd, event, setting) {
  if (cmd === "status") {
    return featuredb.mustcall["status"]();
  }

  if (!setting.bot) {
    if (!isAdmin(event.source.userId)) {
      return {
        type: "text",
        text: "Bot sedang dalam kondisi luring."
      };
    }
  }

  let bancheck = cekban(event.source.userId, false);
  if (bancheck[0]) {
    if (!isAdmin(event.source.userId)) {
      return {
        type: "text",
        text: "Anda telah di-ban oleh admin sampai " + bancheck[1]
      };
    }
  }

  if (setting.disabledftr[cmd]) {
    if (!isAdmin(event.source.userId)) {
      return {
        type: "text",
        text: "Fitur " + cmd + " dalam kondisi nonaktif"
      };
    }
  }

  return null;
}

function greeting(event) {
  ccc = 1;
  return {
    type: "text",
    text: isAdmin(event.source.userId) ? "kenaps" : "apaan",
    quickReply: db.open(`bot/assets/qr.json`).get()
  };
}

function regexbasedfeature(text) {
  let msg = text;

  if (
    msg.length > 4 &&
    msg.match(/(a)\1\1\1\1+/i) /* msg.match(/^(a)\1*$/i) */
  ) {
    let gblk = db.open(`bot/assets/hacama.json`);
    return Object.assign(gblk.get(), { cmd: "" });
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
      cmd: ""
    };
  }
}

function customfeature(msg) {
  let custcmd = db.open("db/customcmd.json");
  if (custcmd.get(msg)) {
    if (custcmd.get(msg).approved == 1) {
      if (custcmd.get(msg).type == "text") {
        var rep = { type: "text", text: custcmd.get(msg).reply };
        if (custcmd.get(msg + ".sender.name")) {
          rep.sender = {};
          rep.sender.name = custcmd.get(msg + ".sender.name");
          if (custcmd.get(msg + ".sender.img")) {
            rep.sender.iconUrl = custcmd.get(msg + ".sender.img");
          }
        }
        return rep;
      } else if (custcmd.get(msg).type == "image") {
        var rep = {
          type: "image",
          originalContentUrl: custcmd.get(msg).reply,
          previewImageUrl: custcmd.get(msg).reply
        };
        if (custcmd.get(msg + ".sender.name")) {
          rep.sender = {};
          rep.sender.name = custcmd.get(msg + ".sender.name");
          if (custcmd.get(msg + ".sender.img")) {
            rep.sender.iconUrl = custcmd.get(msg + ".sender.img");
          }
        }
        return rep;
      }
    } else {
      return null;
    }
  }
}

function removeArgFromMsg(msg, arg) {
  let args = Object.keys(arg);
  msg = msg.replace(/\n/g, " ");

  let list_arg = [];

  for (let i = 0; i < args.length; i++) {
    if (arg[args[i]] === 1) {
      list_arg.push(" --" + args[i]);
    } else {
      let argz = arg[args[i]];
      if (argz) {
        argz = " " + argz;
      } else {
        argz = "";
      }
      list_arg.push(" -" + args[i] + argz);
    }
  }

  for (let j = 0; j < list_arg.length; j++) {
    msg = msg.replace(list_arg[j], "");
  }

  return msg;
}
