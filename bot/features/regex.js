const db = require("@utils/database");

module.exports = function(parsed, event, bot) {
  let msg = parsed.fullMsg;

  if (
    msg.length > 4 &&
    msg.match(/(a)\1\1\1\1+/i) /* msg.match(/^(a)\1*$/i) */
  ) {
    let gblk = db.open(`bot/assets/hacama.json`);
    return Object.assign(gblk.get(), { cmd: "aaaaa" });
  }

  /*
  if (
    msg[0].toLowerCase() == "g" &&
    msg.length > 2 &&
    msg.match(/(r)\1\1+/i)
  ) {
    return {
      type: "image",
      originalContentUrl: "https://i.ibb.co/jbTKmQc/grr.jpg", //"https://i.ibb.co/ChLFsXr/184101.jpg",
      previewImageUrl: "https://i.ibb.co/jbTKmQc/grr.jpg",
      cmd: "grr"
    };
  }*/
};
