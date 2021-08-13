const fs = require("fs");
const features = require("./features/postback")();
const keywords = Object.keys(features);

module.exports = {
  exec: postback
};

async function postback(event) {
  let postbackData = parsePostbackData(event);
  let { command, data } = postbackData;

  let reply = null;

  if (keywords.includes(command)) {
    reply = await Promise.resolve(features[command](data, event));
  }

  return reply;
}

function parsePostbackData(event) {
  let eventdata = event.postback.data;

  let isjson = false;
  let data = {};

  try {
    let json = JSON.parse(eventdata);
    data.command = json.cmd;
    data.data = json.data;
  } catch (e) {
    let pbdk = eventdata.split(/,|-|\|/);
    data.command = pbdk[0];
    data.data = pbdk;
  }

  return data;
}
