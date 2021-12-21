const app = require("express").Router();
const fs = require("fs");
const db = require("./../service/database");
const hash = require("./../service/hash");
const imgbb = require("./../service/imgbb");
const { convertTZ, cekban, isAdmin, pushMessage: pm } = require("./../bot/utility");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

app.get("/latency/graph", latency_graph);
app.get("/latency/get", latency_get);
app.get("/chat/getcontent", chat_getcontent);
app.get("/command/data", command_data);
app.get("/turn/:type/:state", state_edit);
app.get("/getavaildate", getavaildate);

app.post("/ban", banuser);
app.post("/unban", unbanuser);
app.post("/command/:tipe", upload.single("image"), command_handleapi);
app.post("/command/delete/image", command_deleteimage);

function pushMessage(id, msg) {
  return pm(msg, id)
}

function getavaildate(req, res) {
  res.send({
    data: fs.readdirSync(__dirname + "/../db/chat/history").map(data => {
      return parseInt(data.replace(".json", ""));
    })
  });
}

function state_edit(req, res) {
  if (
    req.session.uid &&
    isAdmin(req.session.uid) &&
    (req.params.state == "on" || req.params.state == "off") &&
    req.params.type == "bot"
  ) {
    let dbb = db.open("bot/setting.json");
    let type = "";
    if (req.params.type == "bot") {
      type = "bot";
    }
    let state = req.params.state == "on" ? 1 : 0;
    dbb.set(type, state);
    dbb.save();
    res.send({ result: true });
  } else {
    res.send({ result: false });
  }
}

function command_handleapi(req, res) {
  if (req.params.tipe == "new") {
    command_new(req, res);
  } else if (req.params.tipe == "enable") {
    command_enable(req, res);
  } else if (req.params.tipe == "disable") {
    command_disable(req, res);
  } else if (req.params.tipe == "delete") {
    command_delete(req, res);
  }
}

function command_delete(req, res) {
  let dbc = db.open("db/customcmd.json");
  let db2 = db.open("db/latency.json");
  if (
    req.session.uid &&
    dbc.get(req.body.cmd.toLowerCase()) &&
    (dbc.get(req.body.cmd.toLowerCase()).requesterid == hash(req.session.uid) ||
      isAdmin(req.session.uid)) &&
    dbc.get(req.body.cmd.toLowerCase()).approved == 0
  ) {
    if (req.body.ye) {
      dbc.unset(req.body.cmd.toLowerCase());
      dbc.save();
      db2.unset(req.body.cmd.toLowerCase());
      db2.save();
      res.send({ result: true });
    } else {
      res.send({ result: false });
    }
  } else {
    res.send({ result: false });
  }
}

function command_disable(req, res) {
  let dbc = db.open("db/customcmd.json");
  if (
    req.session.uid &&
    isAdmin(req.session.uid) &&
    dbc.get(req.body.cmd.toLowerCase())
  ) {
    dbc.set(req.body.cmd.toLowerCase() + ".approved", 0);
    dbc.save();
    res.send({ result: true });
  } else {
    res.send({ result: false });
  }
}

function command_enable(req, res) {
  let dbc = db.open("db/customcmd.json");
  if (
    req.session.uid &&
    isAdmin(req.session.uid) &&
    dbc.get(req.body.cmd.toLowerCase())
  ) {
    dbc.set(req.body.cmd.toLowerCase() + ".approved", 1);
    dbc.save();
    res.send({ result: true });
  } else {
    res.send({ result: false });
  }
}

function command_data(req, res) {
  if (req.session.uid) {
    let dbcmd = db.open("db/customcmd.json");
    if (!req.query.cmd || !dbcmd.get(req.query.cmd.toLowerCase())) {
      res.send({ result: false, reason: "Invalid Cmd" });
    } else {
      res.send({
        result: true,
        reason: dbcmd.get(req.query.cmd.toLowerCase())
      });
    }
  } else {
    res.send({ result: false, reason: "Unauthorized" });
  }
}

function command_deleteimage(req, res) {
  let dbimg = db.open("db/featureimg.json");
  let dbc = db.open("db/customcmd.json");
  if (req.session.uid && isAdmin(req.session.uid) && req.body.id) {
    if (dbimg.get(req.body.id)) {
      //console.log(dbc.get(dbimg.get(req.body.id).cmd))
      if (
        !dbc.get(dbimg.get(req.body.id).cmd) ||
        (dbc.get(dbimg.get(req.body.id).cmd) &&
          dbc.get(dbimg.get(req.body.id).cmd).reply !=
            dbimg.get(req.body.id).url)
      ) {
        let url = dbimg.get(req.body.id).del;
        dbimg.unset(req.body.id);
        dbimg.save();
        res.send({ result: true, url: url });
      } else {
        res.send({ result: false });
      }
    } else {
      res.send({ result: false });
    }
  } else {
    res.send({ result: false });
  }
}

function banuser(req, res) {
  if (req.session.uid && isAdmin(req.session.uid)) {
    let dbban = db.open("db/ban.json");
    dbban.set(req.body.uid, Date.now() + 1000 * 600);
    dbban.save();
    res.send({ result: true });
  } else {
    res.send({ result: false });
  }
}

function unbanuser(req, res) {
  if (req.session.uid && isAdmin(req.session.uid)) {
    let dbban = db.open("db/ban.json");
    dbban.set(req.body.uid, 0);
    dbban.save();
    res.send({ result: true });
  } else {
    res.send({ result: false });
  }
}

function latency_graph(req, res) {
  res.render("latency2", { cmd: req.query.cmd });
}

function latency_get(req, res) {
  if (req.query.id) {
    let data = db.open("db/latency.json");
    if (req.query.id == 1) {
      res.send(data.get());
    } else {
      if (!!data.get(req.query.id)) {
        res.send(data.get(req.query.id));
      } else {
        res.send("invalid");
      }
    }
  }
}

function chat_getcontent(req, res) {
  let id = req.query.id;

  if (!id.match(/bot/)) {
    res.send({});
    return;
  }

  let a = convertTZ(new Date(), "Asia/Jakarta");
  let date = convertTZ(
    new Date(`${a.getMonth() + 1}/${a.getDate()}/${a.getFullYear()}`),
    "Asia/Jakarta"
  ).getTime();

  if (
    req.query.date &&
    req.query.date != "" &&
    req.query.date != "null" &&
    !isNaN(req.query.date)
  ) {
    date = req.query.date;
  }

  let temlendb = db.open("db/chat/history/" + date + ".json");

  res.send(
    !id
      ? {}
      : !fs
          .readdirSync(__dirname + "/../db/chat/history")
          .includes(date + ".json")
      ? {}
      : temlendb.get(id)
  );
}

function command_new(req, res) {
  function validURL(str) {
    let pattern = new RegExp(
      "^(https?:\\/\\/)?" + // protocol
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
      "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
      "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
        "(\\#[-a-z\\d_]*)?$",
      "i"
    ); // fragment locator
    return !!pattern.test(str);
  }
  if (/*isAdmin*/ req.session.uid) {
    //console.log(req.file)
    if (
      req.body.title == "" ||
      req.body.desc == "" ||
      req.body.cmd == "" ||
      req.body.type == ""
    ) {
      res.send({ result: false, reason: "There is empty value!" });
      return false;
    }
    let cmddd = req.body.cmd.toLowerCase();
    let bypasskey = "~";
    let bypassregex = new RegExp(`^${bypasskey}`);
    let bypass = cmddd.match(bypassregex);
    let dbb = db.open("db/customcmd.json");
    let db2 = db.open("db/fitur.json");
    let user = db.open("db/user.json");
    if (cmddd.split(" ").length > 10) {
      res.send({
        result: false,
        reason: "Maximum word is 10 words" //"Command must be one word (without space)"
      });
    } else if (!isNaN(cmddd)) {
      res.send({
        result: false,
        reason: "Invalid Command (There must be atleast one alphabet)"
      });
    } else if (!bypass && !/^[a-z0-9\s]+$/gi.test(cmddd)) {
      //(!/^[a-z0-9]+$/gi.test(cmddd)) {
      res.send({
        result: false,
        reason: "Invalid Command (Alphanumeric and space only)"
      });
    } else if (req.body.title.length > 20) {
      res.send({
        result: false,
        reason: "Maximum title length is 20 letter!"
      });
    } /* else if (cmddd.length > 20) {
      res.send({
        result: false,
        reason: "Maximum command length is 20 letter!"
      });
    }*/ else {
      //console.log(req.body.isedit)
      if (cmddd.match(/\./g)) {
        res.send({
          result: false,
          reason: "Invalid Command (dot is not allowed)"
        });
        return;
      }
      if (bypass) {
        cmddd = cmddd.replace(bypassregex, "");
      }
      if ((dbb.get(cmddd) || db2.get(cmddd)) && req.body.isedit != "1") {
        res.send({ result: false, reason: "Command is already registered!" });
      } else {
        if (
          (dbb.get(cmddd) &&
            dbb.get(cmddd).requesterid != hash(req.session.uid)) ||
          db2.get(cmddd)
        ) {
          res.send({ result: false, reason: "Forbidden" });
        } else {
          if (req.body.isedit == "1" && dbb.get(cmddd + ".approved") == 1) {
            res.send({
              result: false,
              reason:
                "Command is active! You must set it off first or contact admin."
            });
          } else {
            if (req.body.type == "text" || req.body.type == "flex") {
              if (req.body.text == "") {
                res.send({ result: false, reason: "There is empty value!" });
              } else {
                if (req.body.senderimg) {
                  if (!validURL(req.body.senderimg)) {
                    res.send({
                      result: false,
                      reason: "Invalid Sender Image URL!"
                    });
                    return false;
                  } else {
                    if (req.body.sendername != "") {
                      dbb.set(cmddd + ".sender.img", req.body.senderimg);
                    } else {
                      res.send({
                        result: false,
                        reason:
                          "If you fill the sender image, sender name must be filled too."
                      });
                      return false;
                    }
                  }
                }
                dbb.set(cmddd + ".title", req.body.title);
                dbb.set(cmddd + ".desc", req.body.desc);
                dbb.set(cmddd + ".type", req.body.type);
                dbb.set(cmddd + ".reply", req.body.text);
                dbb.set(cmddd + ".time", Date.now());
                dbb.set(cmddd + ".approved", isAdmin(req.session.uid) ? 1 : 0);
                dbb.set(
                  cmddd + ".requester",
                  user.get(hash(req.session.uid)).name
                );
                dbb.set(cmddd + ".requesterid", hash(req.session.uid));
                dbb.set(cmddd + ".sender.name", req.body.sendername);
                dbb.save();
                if (!isAdmin(req.session.uid)) {
                  pushMessage(process.env.admin_id, {
                    type: "text",
                    text:
                      "New command request from " +
                      req.body.sendername +
                      "\n\nhttps://gblkbt1991.glitch.me/command"
                  });
                }
                res.send({ result: true, reason: "" });
              }
            } else if (req.body.type == "image") {
              /*if (req.body.img == "") {
                  res.send({ result: false, reason: "There is empty value!" });
                } else if (!validURL(req.body.img)) {
                  res.send({ result: false, reason: "Invalid URL!" });*/
              function validimg(file) {
                let t = file.mimetype
                  .split("/")
                  .pop()
                  .toLowerCase();
                return !(
                  t != "jpeg" &&
                  t != "jpg" &&
                  t != "png" &&
                  t != "bmp" &&
                  t != "gif"
                );
              }
              if (!req.file) {
                if (req.body.img == "") {
                  res.send({
                    result: false,
                    reason: "There is empty value!"
                  });
                } else if (!validURL(req.body.img)) {
                  res.send({ result: false, reason: "Invalid URL!" });
                } else {
                  if (req.body.senderimg) {
                    if (!validURL(req.body.senderimg)) {
                      res.send({
                        result: false,
                        reason: "Invalid Sender Image URL!"
                      });
                      return false;
                    } else {
                      if (req.body.sendername != "") {
                        dbb.set(cmddd + ".sender.img", req.body.senderimg);
                      } else {
                        res.send({
                          result: false,
                          reason:
                            "If you fill the sender image, sender name must be filled too."
                        });
                        return false;
                      }
                    }
                  }
                  dbb.set(cmddd + ".title", req.body.title);
                  dbb.set(cmddd + ".desc", req.body.desc);
                  dbb.set(cmddd + ".type", req.body.type);
                  dbb.set(cmddd + ".reply", req.body.img);
                  dbb.set(cmddd + ".time", Date.now());
                  dbb.set(
                    cmddd + ".approved",
                    isAdmin(req.session.uid) ? 1 : 0
                  );
                  dbb.set(
                    cmddd + ".requester",
                    user.get(hash(req.session.uid)).name
                  );
                  dbb.set(cmddd + ".requesterid", hash(req.session.uid));
                  dbb.set(cmddd + ".sender.name", req.body.sendername);
                  dbb.save();
                  if (!isAdmin(req.session.uid)) {
                    pushMessage(process.env.admin_id, {
                      type: "text",
                      text:
                        "New command request from " +
                        req.body.sendername +
                        "\n\nhttps://gblkbt1991.glitch.me/command"
                    });
                  }
                  res.send({ result: true, reason: "" });
                }
              } else {
                if (!validimg(req.file)) {
                  res.send({
                    result: false,
                    reason:
                      "Invalid Image File! (Only accept jpeg/jpg/png/bmp/gif)"
                  });
                } else if (req.file.size > 3072000) {
                  res.send({
                    result: false,
                    reason: "Maximum file size exceeded! (Max 3 MB)"
                  });
                } else {
                  if (req.body.senderimg) {
                    if (!validURL(req.body.senderimg)) {
                      res.send({
                        result: false,
                        reason: "Invalid Sender Image URL!"
                      });
                      return false;
                    } else {
                      if (req.body.sendername != "") {
                        dbb.set(cmddd + ".sender.img", req.body.senderimg);
                      } else {
                        res.send({
                          result: false,
                          reason:
                            "If you fill the sender image, sender name must be filled too."
                        });
                        return false;
                      }
                    }
                  }
                  /*if (
                      req.body.isedit == "0" ||
                      (req.body.isedit == "1" && req.file)
                    ) {*/
                  imgbb
                    .upload({
                      name: cmddd,
                      base64string: req.file.buffer.toString("base64")
                    })
                    .then(data => {
                      data = { data: data };
                      let d = db.open("db/featureimg.json");
                      d.set(data.data.id + ".cmd", cmddd);
                      d.set(data.data.id + ".url", data.data.url);
                      d.set(data.data.id + ".thumb", data.data.display_url);
                      d.set(
                        data.data.id + ".uploader",
                        user.get(hash(req.session.uid)).name
                      );
                      d.set(data.data.id + ".del", data.data.delete_url);
                      d.save();
                      //console.log(data)
                      dbb.set(cmddd + ".title", req.body.title);
                      dbb.set(cmddd + ".desc", req.body.desc);
                      dbb.set(cmddd + ".type", req.body.type);
                      dbb.set(cmddd + ".reply", data.data.url);
                      dbb.set(cmddd + ".time", Date.now());
                      dbb.set(
                        cmddd + ".approved",
                        isAdmin(req.session.uid) ? 1 : 0
                      );
                      dbb.set(
                        cmddd + ".requester",
                        user.get(hash(req.session.uid)).name
                      );
                      dbb.set(cmddd + ".requesterid", hash(req.session.uid));
                      dbb.set(cmddd + ".sender.name", req.body.sendername);
                      dbb.save();
                      if (!isAdmin(req.session.uid)) {
                        pushMessage(process.env.admin_id, {
                          type: "text",
                          text:
                            "New command request from " +
                            req.body.sendername +
                            "\n\nhttps://gblkbt1991.glitch.me/command"
                        });
                      }
                      res.send({ result: true, reason: "" });
                    });
                  /*} else {
                      dbb.set(cmddd + ".title", req.body.title);
                      dbb.set(cmddd + ".desc", req.body.desc);
                      dbb.set(cmddd + ".type", req.body.type);
                      //dbb.set(cmddd + ".reply", data.data.url);
                      dbb.set(cmddd + ".time", Date.now());
                      dbb.set(
                        cmddd + ".approved",
                        isAdmin(req.session.uid) ? 1 : 0
                      );
                      dbb.set(
                        cmddd + ".requester",
                        user.get(md5(req.session.uid)).name
                      );
                      dbb.set(cmddd + ".requesterid", md5(req.session.uid));
                      dbb.set(cmddd + ".sender.name", req.body.sendername);
                      dbb.save();
                      res.send({ result: true, reason: "" });
                    }*/
                }
              }
            }
          }
        }
      }
    }
  } else {
    res.send({ result: false, reason: "Unauthorized" });
  }
}

module.exports = app;
