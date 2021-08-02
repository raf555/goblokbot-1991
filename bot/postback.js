const fs = require("fs");
const features = require("./features/postback")();
const keywords = Object.keys(features);

module.exports = {
  exec: postback
};

async function postback(event) {
  let pbd = event.postback.data;
  let pbdk = pbd.split(",");

  let reply = null;
  
  if (keywords.includes(pbdk[0])) {
    reply = await Promise.resolve(features[pbdk[0]](pbdk))
  }

  return reply;
}
