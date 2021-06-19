const { line, client, config, message } = require("./../service/line");
const hash = require("./../service/hash");
const db = require("./../service/database");
const imgbb = require("./../service/imgbb");
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
  saveUnsend
};

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

function pushMessage(id, msg) {
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

function replyMessage(event, msg) {
  let eee = Array.isArray(msg) ? msg : [msg];

  let data_ = [];

  for (let i = 0; i < eee.length; i++) {
    data_.push({
      cmd: eee[i].cmd,
      parsed: eee[i].parsed,
      latency: eee[i].latency,
      cmdtype: eee[i].cmdtype
    });

    delete eee[i]["cmd"];
    delete eee[i]["parsed"];
    delete eee[i]["latency"];
    delete eee[i]["cmdtype"];
  }

  let ftr = data_[0].cmd;
  let parsed = data_[0].parsed;
  let lat = data_[0].latency;

  let file = db.open(`db/latency.json`);
  let latency = lat || Date.now() - event.timestamp;

  let reply = (() => {
    if (parsed && parsed.args.showtime) {
      eee.push({ type: "text", text: "Time spent: " + latency + " ms" });
    }

    if (latency >= 7500) {
      const ex = {
        type: "text",
        text: "Sorry for late reply, " + latency + " ms."
      };
      if (latency <= 30000) {
        //eee.push(ex);
        eee.unshift(ex);
      } else {
        eee = [
          {
            type: "text",
            text: "Bot telat bales (" + latency + " ms), tolong kirim ulang."
          }
        ];
      }
    }

    return client.replyMessage(event.replyToken, eee).then(() => {
      savebotchat(event, eee);
      return true;
    });
  })();

  /* write latency */
  let writelat = (() => {
    for (let i = 0; i < data_.length; i++) {
      ftr = data_[i].cmd;
      parsed = data_[i].parsed;
      lat = data_[i].latency;
      latency = lat || Date.now() - event.timestamp;

      if (!ftr) {
        continue;
      }

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
    let cmdhist = db.open("db/cmdhistory.json");
    for (let i = 0; i < data_.length; i++) {
      let id = Object.keys(cmdhist.get()).length + 1;

      parsed = data_[i].parsed;

      parsed.id = event.source.userId;
      parsed.ts = Date.now();
      parsed.lat = latency;

      if (data_[i].cmdtype === "other") {
        parsed.isothercmd = true;
      }

      cmdhist.set(id.toString(), parsed);
    }
    cmdhist.save();

    return true;
  })();

  return reply;
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

function uploadImgFromQ(event) {
  let qdb = db.open("db/uploadimgq.json");

  let data = qdb.get(event.source.userId);
  if (data && !data.uploaded && data.expire > Date.now()) {
    qdb.set(event.source.userId + ".uploaded", true);
    qdb.save();
    let idb = db.open("db/uploadimg.json");
    let buffer = [];
    client.getMessageContent(event.message.id).then(stream => {
      stream.on("data", chunk => {
        buffer.push(chunk);
      });
      stream.on("end", () => {
        let uploaddata = {
          name: data.name,
          base64string: Buffer.concat(buffer).toString("base64")
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

function log(event) {
  let place = event.source.groupId
    ? client.getGroupMemberProfile(event.source.groupId, event.source.userId)
    : client.getProfile(event.source.userId);

  place.then(profile => {
    // save the id and user
    if (event.source.groupId) {
      const debe = db.open("db/user.json");
      debe.set(hash(event.source.userId) + ".name", profile.displayName);
      debe.set(
        hash(event.source.userId) + ".image",
        profile.pictureUrl ||
          "https://cdn.glitch.com/6fe2de81-e459-4790-8106-a0efd4b2192d%2Fno-image-profile.png?v=1622879440349"
      );
      if (!debe.get(hash(event.source.userId) + ".id")) {
        debe.set(hash(event.source.userId) + ".id", event.source.userId);
      }
      debe.save();
    }
    if (event.message) {
      console.log(
        event.source.userId,
        profile.displayName,
        "\n" +
          (event.message.text || event.message.type) +
          "\n==============================="
      );
    }
  });
}

function savebotchat(event, msg) {
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
      ".json",
    { autosave: true }
  );
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

  if (!Array.isArray(msg)) {
    msg = [msg];
  }

  msg.forEach(msg => {
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
    temlendb.set("bot" + event.timestamp, data);
  });
  // save stop//
}

function saveImage(event) {
  const setting = db.open("bot/setting.json").get();

  if (!setting.saveMessage.message || !setting.saveMessage.image) {
    return;
  }

  if (!event.source.groupId) {
    return;
  }

  let dbimg = db.open("db/chat/chatimg.json");
  let buffer = [];

  client.getMessageContent(event.message.id).then(stream => {
    stream.on("data", chunk => {
      buffer.push(chunk);
    });
    stream.on("end", () => {
      imgbb
        .upload({
          name: event.message.id,
          base64string: Buffer.concat(buffer).toString("base64"),
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
    });
  });
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
