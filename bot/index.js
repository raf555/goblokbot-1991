const { text, image, postback } = require("./command");
const {
  replyMessage,
  saveMessage,
  log,
  saveImage,
  saveUnsend,
  uploadImgFromQ,
  validateSource,
  leave
} = require("./utility");
const { addSocialCredit, addMoreSocialCredit } = require("./socialcredit");

module.exports = {
  handleEvent: handleEvent
};

function handleEvent(event) {
  event.timestamp2 = Date.now();

  // limit to grup only and member
  return validateSource(event)
    .then(() => {
      // log the event
      log(event);

      // handle event
      switch (event.type) {
        case "message":
          return handleMessageEvent(event);
        case "unsend":
          return handleUnsendEvent(event);
        case "postback":
          return handlePostbackEvent(event);
        case "join":
          return handleJoinEvent(event);
        default:
          return null;
      }
    })
    .catch(handleInvalidSource(event));

  //return client.replyMessage(event.replyToken, message.text("tes"));
}

function handleInvalidSource(event) {
  return require("./instruction.js")(event);
}

function handleMessageEvent(event) {
  // save messages
  saveMessage(event);

  // add social credit
  if (event.source.roomId || event.source.groupId) {
    let sc = addSocialCredit(event.source.userId);
    if (sc && sc.levelchange) {
      if (event.message.type === "text") {
        let t = event.message.text;
        event.message.text = t + " ; !levelup " + JSON.stringify(sc.messageobj);
      } else {
        return replyMessage(event, sc.messageobj);
      }
    }
  }

  let message = event.message;
  switch (message.type) {
    case "text":
      return handleTextMessage(event);
    case "image":
      return handleImgMessage(event);
    default:
      return null;
  }
}

function handleTextMessage(event) {
  let message = event.message;
  return handleCMD(text.execMultiple(message.text, event), event);
}

function handleImgMessage(event) {
  uploadImgFromQ(event);
  saveImage(event);
  return handleCMD(image.execImage(event), event);
}

function handlePostbackEvent(event) {
  return handleCMD(postback.exec(event), event);
}

function handleUnsendEvent(event) {
  saveUnsend(event);
  return null;
}

function handleJoinEvent(event) {
  return validateSource(event)
    .then(() => ({}))
    .catch(e => {
      if (e === "invalidgroup") {
        return leave(event).then(() => null);
      }
      return null;
    });
}

function handleCMD(func, event) {
  return func.then(handleReply(event)).catch(handleReplyErr(event));
}

function handleReply(event) {
  return function(reply) {
    if (reply) {
      // add social credit if use bot
      if (event.source.roomId || event.source.groupId) {
        let sc = addMoreSocialCredit(event.source.userId);
        if (sc && sc.levelchange) {
          if (reply.length > 4) reply = reply.slice(0, 4);
          reply.push(sc.messageobj);
        }
      }
      return replyMessage(event, reply);
    }
    return null;
  };
}

function handleReplyErr(event) {
  return function(e) {
    console.error(e);
    /*let out = "Error occured, please tag Admin\n\n";
  out += "Error: " + e.name + " - " + e.message;*/
    let out = `${e.name}: ${e.message}`;
    return replyMessage(event, {
      type: "text",
      text: out,
      nosave: true,
      latency: 1
    });
  };
}
