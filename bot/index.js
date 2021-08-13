const command = require("./command");
const postback = require("./postback");
const {
  replyMessage,
  saveMessage,
  log,
  saveImage,
  saveUnsend,
  isMember,
  leave,
  uploadImgFromQ
} = require("./utility");

module.exports = {
  handleEvent: handleEvent
};

function handleEvent(event) {
  //event.timestamp = Date.now();

  // limit to grup only and member
  if (event.source.roomId) {
    return leave(event).then(() => null);
  }
  if (event.source.groupId && event.source.groupId !== process.env.group_id) {
    return leave(event).then(() => null);
  }
  if (!event.source.groupId) {
    if (event.source.userId && !isMember(event.source.userId)) {
      return null;
    }
  }

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

  //return client.replyMessage(event.replyToken, message.text("tes"));
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
  return command
    .execMultiple(message.text, event)
    .then(data => (data ? replyMessage(event, data) : null))
    .catch(e => handleReplyErr(e, event));
}

function handleImgMessage(event) {
  uploadImgFromQ(event);
  saveImage(event);
  return null;
}

function handlePostbackEvent(event) {
  return postback
    .exec(event)
    .then(reply => (reply ? replyMessage(event, reply) : null))
    .catch(e => handleReplyErr(e, event));
}

function handleUnsendEvent(event) {
  saveUnsend(event);
  return null;
}

function handleJoinEvent(event) {
  if (event.source.roomId || event.source.groupId !== process.env.group_id) {
    return leave(event).then(() => null);
  }
}

function handleReplyErr(e, event) {
  console.error(e);
  /*let out = "Error occured, please tag Admin\n\n";
  out += "Error: " + e.name + " - " + e.message;*/
  let out = `${e.name}: ${e.message}`;
  return replyMessage(event, { type: "text", text: out });
}
