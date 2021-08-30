const { log, replyMessage, leave, hash } = require("./utility");

module.exports = event => {
  return function(e) {
    let eventtype = event.type;
    if (
      !process.env.admin_id &&
      !(process.env.admin_id && (process.env.group_id || process.env.room_id))
    ) {
      let slug;
      if (event.source.groupId) {
        slug = "group_id";
      } else {
        if (event.source.roomId) {
          slug = "room_id";
        } else {
          slug = "admin_id;";
        }
      }
      let src = event.source.groupId || event.source.roomId;
      if (event.message && event.message.text) {
        if (event.message.text.toLowerCase() === "!register") {
          return init(event, src, slug)
            .then(() => {
              return replyMessage(event, {
                type: "text",
                text:
                  "Registered! Bot will be restarted within 1 second to take effect.\n\n" +
                  "You can send message `tes` for several times to test the bot (it will reply your message if the registration is completed)."
              });
            })
            .catch(e => {
              console.error(e);
              return replyMessage(event, {
                type: "text",
                text:
                  "Something wrong with the registration, please check the log."
              });
            });
        }
      }

      return null;
    }

    if (e === "invalidgroup") {
      return leave(event).then(() => null);
    }

    return null;
  };
};

async function init(event, src, slug) {
  const db = require("@utils/database");
  const fs = require("fs");
  const { execSync } = require("child_process");

  /* append field in .env */
  if (fs.existsSync(".env")) {
    let r = fs.readFileSync(".env");
    let t = r[r.length - 1] !== "\n" ? "\n" : "";
    t += "admin_id=" + event.source.userId + "\n";
    if (slug !== "admin_id" && src) t += slug + "=" + src + "\n";
    fs.appendFileSync(".env", t);
  }
  
  /* create database folder */
  execSync("mkdir db db/bak db/chat");

  /* add admin to user db and admin db */
  let admin = db.open("db/admin.json");
  admin.set(hash(event.source.userId), 1);
  admin.save();
  await log(event);

  /* restart the bot */
  setTimeout(execSync, 1000, "refresh");

  return true;
}
