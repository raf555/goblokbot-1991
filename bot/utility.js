const { client } = require("@utils/line");
const hash = require("@utils/hash");
const db = require("@utils/database");
const imgbb = require("@utils/imgbb");
const fs = require("fs");

module.exports = {
  saveMessage,
  convertTZ,
  log,
  pushMessage,
  replyMessage,
  cekban,
  isAdmin,
  hash,
  angkaAcak,
  saveImage,
  detiktostr,
  detiktojam,
  isMember,
  leave,
  dateTodate,
  uploadImgFromQ,
  saveUnsend,
  getContentFromEvent,
  validateSource,
  gethashidfromkey,
  gethashidfromuid
};

function gethashidfromkey(key, data) {
  if (!data) {
    data = db.open("db/user.json").get();
  }
  let a = Object.keys(data);
  let b = Object.values(data);
  let i = b.findIndex(d => d.key === key.toLowerCase());
  if (i === -1) {
    return null;
  }
  return a[i];
}

function gethashidfromuid(id, data) {
  if (!data) {
    data = db.open("db/user.json").get();
  }
  let a = Object.keys(data);
  let b = Object.values(data);
  let i = b.findIndex(d => d.id === id);
  if (i === -1) {
    return null;
  }
  return a[i];
}

function validateSource(event) {
  return new Promise((resolve, reject) => {
    if (
      (event.source.roomId && event.source.roomId !== process.env.room_id) ||
      (event.source.groupId && event.source.groupId !== process.env.group_id)
    ) {
      reject("invalidgroup");
      return;
    }

    if (!event.source.groupId) {
      if (event.source.userId && !isMember(event.source.userId)) {
        reject("invaliduser");
        return;
      }
    }

    resolve();
  });
}

function leave(event) {
  if (event.source.groupId) {
    return client
      .leaveGroup(event.source.groupId)
      .then(() => {})
      .catch(err => {});
  } else if (event.source.roomId) {
    return client
      .leaveRoom(event.source.roomId)
      .then(() => {})
      .catch(err => {});
  }
}

function pushMessage(msg, id) {
  return client
    .pushMessage(id, msg)
    .then(() => {
      return true;
    })
    .catch(err => {
      console.log(err);
      return false;
    });
}

function replyMessage(event, msgobj) {
  if (msgobj.time_metadata) delete msgobj["time_metadata"];

  let msg = Array.isArray(msgobj) ? msgobj : [msgobj];

  let data_ = [];

  for (let i = 0; i < msg.length; i++) {
    data_.push({
      cmd: msg[i].cmd,
      alias: msg[i].alias,
      parsed: msg[i].parsed,
      latency: msg[i].latency,
      cmdtype: msg[i].cmdtype,
      nosave: msg[i].nosave,
      realtime: msg[i].realtime
    });

    delete msg[i]["cmd"];
    delete msg[i]["alias"];
    delete msg[i]["parsed"];
    delete msg[i]["latency"];
    delete msg[i]["cmdtype"];
    delete msg[i]["nosave"];
    delete msg[i]["realtime"];
  }

  let ftr = data_[0].cmd;
  let parsed = data_[0].parsed;
  let lat = data_[0].latency;
  let latency = lat || Date.now() - event.timestamp;

  let reply = (() => {
    if (parsed) {
      handleReservedArgs(msg, parsed, event, data_);
    }

    if (latency >= 7500) {
      const ex = {
        type: "text",
        text: "Sorry for late reply, " + latency + " ms."
      };
      msg.unshift(ex);
      /*
      if (latency <= 30000) {
        //msg.push(ex);
        msg.unshift(ex);
      } else {
        msg = [
          {
            type: "text",
            text: "Bot telat bales (" + latency + " ms), tolong kirim ulang."
          }
        ];
      }*/
    }

    msg = msg.slice(0, 5);

    return client
      .replyMessage(event.replyToken, msg)
      .then(() => {
        savebotchat(event, msg);
        return true;
      })
      .catch(e => {
        console.error(e);
        console.log("Failed to reply message");
        return false;
      });
  })();

  Promise.resolve(reply).then(res => {
    if (!res) return;

    let file = db.open(`db/latency.json`);
    let cmdhist = db.open("db/cmdhistory.json");

    /* write latency */
    let writelat = (() => {
      for (let i = 0; i < data_.length; i++) {
        if (data_[i].nosave) continue;

        ftr = data_[i].cmd;
        lat = data_[i].latency;
        latency = lat || Date.now() - event.timestamp;

        if (!ftr) {
          continue;
        }

        // if (latency > 30000) {
        //  continue;
        // }

        let data = file.get(ftr);
        if (!data) {
          file.set(ftr + ".avg", latency);
          file.set(ftr + ".0", latency);
        } else {
          let tot = Object.keys(data).length - 1;
          let lat = latency;

          delete data["avg"];
          lat += Object.values(data).reduce((total, num) => total + num);

          file.set(ftr + "." + tot, latency);
          file.set(ftr + ".avg", Math.round(lat / (tot + 1)));
        }
        file.save();
      }
      return true;
    })();

    /* save cmd */
    let savecmd = (() => {
      for (let i = 0; i < data_.length; i++) {
        if (data_[i].nosave) continue;

        parsed = data_[i].parsed;
        if (!parsed || !data_[i].cmd) continue;

        let id = Object.keys(cmdhist.get()).length + 1;

        parsed.command = data_[i].cmd;
        parsed.id = event.source.userId;
        parsed.ts = Date.now();
        parsed.lat = latency;
        parsed.realtime = data_[i].realtime;

        if (data_[i].alias) {
          parsed.alias = data_[i].alias;
        }

        if (data_[i].cmdtype === "other") {
          parsed.isothercmd = true;
        }

        parsed.fromGroup = event.source.groupId || null;

        cmdhist.set(id.toString(), parsed);
      }
      cmdhist.save();

      return true;
    })();
  });

  return reply;
}

function handleReservedArgs(msg, parsed, event, data) {
  if (parsed.args.showtime) {
    let ts = data[data.length - 1].realtime;
    let latency = data[0].latency || Date.now() - event.timestamp;
    msg.push({
      type: "text",
      text: `Time spent: ${ts} ms\nLatency: ${latency} ms\nDelay: ${latency -
        ts} ms`
    });
  }

  if (parsed.args.showid) {
    msg.push({ type: "text", text: "ID: " + event.message.id });
  }

  if (parsed.args.showraw) {
    msg.push({ type: "text", text: JSON.stringify(msg) });
  }
}

function cekban(id, hashed = true) {
  let bandb = db.open("db/ban.json");

  if (!hashed) {
    id = hash(id);
  }

  if (!bandb.get(id)) {
    return [false, 0, 0];
  } else {
    return [
      bandb.get(id) - Date.now() > 0,
      detiktojam(Math.round((bandb.get(id) - Date.now()) / 1000)),
      bandb.get(id)
    ];
  }
}

function getContentFromEvent(event) {
  // return a buffer
  return new Promise((resolve, reject) => {
    let type = event.message.type;
    if (
      !(
        type === "image" ||
        type === "video" ||
        type === "audio" ||
        type === "file"
      )
    ) {
      reject(new TypeError("Message type " + type + " is not allowed!"));
      return;
    }

    let buffer = [];
    client
      .getMessageContent(event.message.id)
      .then(stream => {
        stream.on("data", chunk => {
          buffer.push(chunk);
        });
        stream.on("end", () => {
          resolve(Buffer.concat(buffer));
        });
        stream.on("error", e => reject(e));
      })
      .catch(e => reject(e));
  });
}

async function uploadImgFromQ(event) {
  let qdb = db.open("db/uploadimgq.json");

  let data = qdb.get(event.source.userId);
  if (data && !data.uploaded && data.expire > Date.now()) {
    qdb.set(event.source.userId + ".uploaded", true);
    qdb.save();
    let idb = db.open("db/uploadimg.json");

    let buffer = await getContentFromEvent(event);

    let uploaddata = {
      name: data.name,
      base64string: buffer.toString("base64")
    };
    if (data.exp) {
      uploaddata.expiration = data.exp;
    }
    imgbb
      .upload(uploaddata)
      .then(upload => {
        idb.set(upload.id, {
          url: upload.url,
          del: upload.delete_url,
          exp: data.exp ? Date.now() + data.exp : 99999999999999,
          uploader: event.source.userId
        });
        idb.save();

        let out = [
          {
            type: "text",
            text: upload.url
          }
        ];

        if (qdb.get(event.source.userId).jimp) {
          out.push({
            type: "text",
            text: "For jimp reference, please use id under this message"
          });
          out.push({
            type: "text",
            text: "" + upload.id
          });
        }

        client.replyMessage(event.replyToken, out);
      })
      .catch(err => {
        client.replyMessage(event.replyToken, {
          type: "text",
          text: "Failed to upload image"
        });
      });
  }
}

function isMember(id, hashed = false) {
  if (!hashed) {
    id = hash(id);
  }
  let memberdb = db.open("db/user.json");
  return !!memberdb.get(id);
}

function isAdmin(id, hashed = false) {
  if (!hashed) {
    id = hash(id);
  }
  let admindb = db.open("db/admin.json");
  return admindb.get(id) == 1;
}

function angkaAcak(min, max) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getUserProfile(event) {
  if (event.source.groupId) {
    return client.getGroupMemberProfile(
      event.source.groupId,
      event.source.userId
    );
  }

  if (event.source.roomId) {
    return client.getRoomMemberProfile(
      event.source.roomId,
      event.source.userId
    );
  }

  return client.getProfile(event.source.userId);
}

function log(event) {
  let place = getUserProfile(event);
  let condition = !!(event.source.groupId || event.source.roomId);

  place.then(profile => {
    // save the id and user
    //if (condition) {
    const debe = db.open("db/user.json");
    let hashid = hash(event.source.userId);
    debe.set(hashid + ".name", profile.displayName || "NONAME");
    debe.set(
      hashid + ".image",
      profile.pictureUrl ||
        "https://cdn.glitch.com/6fe2de81-e459-4790-8106-a0efd4b2192d%2Fno-image-profile.png?v=1622879440349"
    );
    if (!debe.get(hashid + ".id")) {
      debe.set(hashid + ".id", event.source.userId);
    }
    if (!debe.get(hashid + ".key")) {
      debe.set(
        hashid + ".key",
        profile.displayName.split(" ")[0].toLowerCase()
      );
    }
    debe.save();
    //}
    if (event.message && condition) {
      // log if messages come from group only
      console.log(
        event.source.userId +
          " " +
          profile.displayName +
          " \n" +
          (event.message.text || event.message.type) +
          "\n==============================="
      );
    }
  });
}

function savebotchat(event, msgdata) {
  const setting = db.open("bot/setting.json").get();

  if (!setting.saveMessage.message) {
    return;
  }

  if (!event.source.groupId) {
    return;
  }

  // save //
  let a = convertTZ(new Date(), "Asia/Jakarta");
  let temlendb = db.open(
    "db/chat/history/" +
      convertTZ(
        new Date(`${a.getMonth() + 1}/${a.getDate()}/${a.getFullYear()}`),
        "Asia/Jakarta"
      ).getTime() +
      ".json"
  );

  if (!Array.isArray(msgdata)) {
    msgdata = [msgdata];
  }

  msgdata.forEach((msg, i) => {
    let data = {
      type: "",
      message: "",
      sender: {
        name: "",
        image: ""
      },
      unsent: false,
      command: event.message.text || null
    };
    data.sender.name = "GoblokBot 1991";
    if (msg.sender && msg.sender.name) {
      data.sender.name = msg.sender.name + " from " + "GoblokBot 1991";
    }
    data.sender.image =
      "https://image.prntscr.com/image/6eSLithqSUGnSevWGNyFZg.png";
    switch (msg.type) {
      case "text":
        data.type = "text";
        data.message = msg.text;
        break;
      case "image":
        data.type = "image";
        data.message = msg.originalContentUrl;
        break;
      case "flex":
        data.type = "flex";
        data.message = JSON.stringify(msg);
        data.altText = msg.altText;
        break;
      default:
        data.type = msg.type;
        data.message = msg.type + " message";
    }
    let tgl = new Date(event.timestamp).toLocaleString("en-US", {
      timeZone: "Asia/Jakarta"
    });
    tgl = new Date(tgl);
    data.time = tgl
      .toISOString()
      .substr(11, 8)
      .slice(0, -3);
    temlendb.set("bot" + (event.timestamp + i), data);
  });
  temlendb.save();
  // save stop//
}

async function saveImage(event) {
  const setting = db.open("bot/setting.json").get();

  if (!setting.saveMessage.message || !setting.saveMessage.image) {
    return;
  }

  if (!event.source.groupId) {
    return;
  }

  let dbimg = db.open("db/chat/chatimg.json");
  let buffer = await getContentFromEvent(event);
  imgbb
    .upload({
      name: event.message.id,
      base64string: buffer.toString("base64"),
      expiration: 15821676
    })
    .then(upload => {
      dbimg.set(event.message.id.toString(), {
        url: upload.url,
        delete: upload.delete_url
      });
      dbimg.save();
      saveMessage(event, true);
    })
    .catch(err => {});
}

function saveUnsend(event) {
  const setting = db.open("bot/setting.json").get();

  if (!setting.saveMessage.message) {
    return;
  }

  if (!event.source.groupId) {
    return;
  }

  let a = convertTZ(new Date(), "Asia/Jakarta");
  let temlendb = db.open(
    "db/chat/history/" +
      convertTZ(
        new Date(`${a.getMonth() + 1}/${a.getDate()}/${a.getFullYear()}`),
        "Asia/Jakarta"
      ).getTime() +
      ".json"
  );
  if (!temlendb.get(event.unsend.messageId)) {
    let files = fs.readdirSync("./db/chat/history");
    let i = files.length - 1;
    for (; i >= 0; i--) {
      temlendb = db.open("db/chat/history/" + files[i]);
      if (temlendb.get(event.unsend.messageId)) {
        temlendb.set(event.unsend.messageId + ".unsent", true);
        temlendb.save();
        break;
      }
    }
  } else {
    temlendb.set(event.unsend.messageId + ".unsent", true);
    temlendb.save();
  }
}

function saveMessage(event, img = false) {
  const setting = db.open("bot/setting.json").get();

  if (!setting.saveMessage.message) {
    return;
  }

  if (!event.source.groupId) {
    return;
  }

  if (event.type == "message") {
    const userdb = db.open("db/user.json");

    let a = convertTZ(new Date(), "Asia/Jakarta");
    let temlendb = db.open(
      "db/chat/history/" +
        convertTZ(
          new Date(`${a.getMonth() + 1}/${a.getDate()}/${a.getFullYear()}`),
          "Asia/Jakarta"
        ).getTime() +
        ".json"
    );

    let tgl = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Jakarta"
    });
    tgl = new Date(tgl);

    let data = {
      type: "",
      uid: event.source.userId,
      message: "",
      sender: {
        id: hash(event.source.userId)
      },
      unsent: false
    };
    switch (event.message.type) {
      case "text":
        data.type = "text";
        data.message = event.message.text;
        break;
      case "image":
        if (!img) {
          return;
        }
        let imgdb = db.open("db/chat/chatimg.json");
        data.type = "image";
        data.message = imgdb.get(event.message.id.toString()).url;
        break;
      case "sticker":
        data.type = "sticker";
        data.message =
          "https://stickershop.line-scdn.net/stickershop/v1/sticker/" +
          event.message.stickerId +
          "/iPhone/sticker@2x.png";
        break;
      case "file":
        data.type = "file";
        data.message = JSON.stringify({
          name: event.message.fileName,
          size: event.message.fileSize
        });
        break;
      default:
        data.type = event.message.type;
        data.message = event.message.type + " message";
    }
    let tgl2 = new Date(event.timestamp).toLocaleString("en-US", {
      timeZone: "Asia/Jakarta"
    });
    tgl2 = new Date(tgl2);
    data.time = tgl2
      .toISOString()
      .substr(11, 8)
      .slice(0, -3);
    temlendb.set(event.message.id, data);
    temlendb.save();
  }
}

function convertTZ(date, tzString) {
  return new Date(
    (typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", {
      timeZone: tzString
    })
  );
}

function detiktostr(d) {
  let sec_num = parseInt(d, 10); // don't forget the second param
  let hours = Math.floor(sec_num / 3600);
  let minutes = Math.floor((sec_num - hours * 3600) / 60);
  let seconds = sec_num - hours * 3600 - minutes * 60;

  if (hours < 10) {
    hours = "0" + hours;
  }
  if (minutes < 10) {
    minutes = "0" + minutes;
  }
  if (seconds < 10) {
    seconds = "0" + seconds;
  }
  return hours + "." + minutes + "." + seconds;
}

function detiktojam(d) {
  d = Number(d);

  let h = Math.floor(d / 3600);
  let m = Math.floor((d % 3600) / 60);
  let s = Math.floor((d % 3600) % 60);

  /*let har = Math.floor(d / (24 * 3600));
  let h = Math.floor((d % (24 * 3600)) / 3600);
  let m = Math.floor((d % (24 * 3600 * 3600)) / 60);
  let s = Math.floor((d % (24 * 3600 * 3600 * 60)) / 60);*/

  //let harDisplay = har > 0 ? har + " hari " : "";
  let hDisplay = h > 0 ? h + " jam " : "";
  let mDisplay = m > 0 ? m + " menit " : "";
  let sDisplay = s > 0 ? s + " detik " : "";
  return /*harDisplay + */ (hDisplay + mDisplay + sDisplay).slice(0, -1);
}

function dateTodate(d) {
  var tgl = d.getDate() < 10 ? "0" + d.getDate() : d.getDate();
  var mon = d.getMonth() + 1 < 10 ? "0" + (d.getMonth() + 1) : d.getMonth() + 1;
  return tgl + "-" + mon + "-" + d.getFullYear();
}
