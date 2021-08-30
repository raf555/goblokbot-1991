const { replyMessage, leave } = require("./utility");

module.exports = event => {
  return function(e) {
    
    // WIP
    
    /* 
    let eventtype = event.type;
    let help =
      "To use the bot, please read the instruction at https://github.com/raf555/goblokbot-1991/blob/main/CONTRIBUTING.md";

    if (eventtype === "message") {
      let { type } = event.message;
      if (type === "text") {
        let text = event.message.text.toLowerCase();
        if (text[0] === "!") {
          text = text.substring(1);
          let out;
          if (text === "help") {
            out = help;
          } else if (text === "register") {
          } else {
            out =
              "User or Group/Room is invalid, please send *!help* for init instruction";
          }
          return replyMessage(event, { type: "text", text: out });
        }
      }
    }

    if (eventtype === "follow") {
      return replyMessage(event, {
        type: "text",
        text:
          "Hi, thank you for using this bot. This bot is designed to only assist one group/room and its member only. \n\n" +
          help
      });
    }

    if (eventtype === "join") {
      return replyMessage(event, {
        type: "text",
        text: "Bot admin please add and send me *!help* for instruction"
      })
        .then(() => {})
        .catch(() => {})
        .then(() => leave(event).then(() => null));
    }
    */

    if (e === "invalidgroup") {
      return leave(event).then(() => null);
    }

    return null;
  };
};
