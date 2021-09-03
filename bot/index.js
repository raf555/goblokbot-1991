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

module.exports = {
  handleEvent: handleEvent
};

function handleEvent(event) {
  //event.timestamp = Date.now();

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
  return text
    .execMultiple(message.text, event)
    .then(handleReply(event))
    .catch(handleReplyErr(event));
}

function handleImgMessage(event) {
  uploadImgFromQ(event);
  saveImage(event);
  return image
    .execImage(event)
    .then(handleReply(event))
    .catch(handleReplyErr(event));
}

function handlePostbackEvent(event) {
  return postback
    .exec(event)
    .then(handleReply(event))
    .catch(handleReplyErr(event));
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

function handleReply(event) {
  return function(reply) {
    return reply ? replyMessage(event, reply) : null;
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
