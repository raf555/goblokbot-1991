const line = require("@line/bot-sdk");
const config = {
  channelAccessToken: process.env.linechat_token,
  channelSecret: process.env.linechat_secret
};
const client = new line.Client(config);

const message = {
  setSender: (messageobject, name, imgurl = null) => {
    messageobject.sender = {
      name: name
    };
    if (imgurl) {
      messageobject.sender.iconUrl = imgurl;
    }
    return messageobject;
  },
  text: text => {
    return { type: "text", text: text };
  },
  image: (previewurl, url) => {
    return {
      type: "image",
      originalContentUrl: url,
      previewImageUrl: previewurl
    };
  }
};

module.exports = {
  line,
  config,
  client,
  message
};
