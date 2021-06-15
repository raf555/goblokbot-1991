const command = require("./command");
const { postback } = require("./postback");
const {
  replyMessage,
  saveMessage,
  isAdmin,
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
    return leave(event).then(() => {
      return null;
    });
  }
  if (event.source.groupId && event.source.groupId !== process.env.group_id) {
    return leave(event).then(() => {
      return null;
    });
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
      break;
    case "unsend":
      saveUnsend(event);
      return null;
    case "postback":
      return handlePostbackEvent(event);
    case "join":
      return handleJoin(event);
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
  let reply = command
    .execMultiple(message.text, event)
    .then(data => {
      if (data) {
        return replyMessage(event, data);
      } else {
        return null;
      }
    })
    .catch(e => {
      console.log(e);
      let out = "Error occured, please tag Admin\n\n";
      out += "Error: " + e.name + " - " + e.message;
      return replyMessage(event, { type: "text", text: out });
    });
}

function handleImgMessage(event) {
  uploadImgFromQ(event);
  saveImage(event);
  return null;
}

function handlePostbackEvent(event) {
  let reply = postback(event);
  return replyMessage(event, reply);
}

function handleJoin(event) {
  if (event.source.roomId || event.source.groupId !== process.env.group_id) {
    return leave(event).then(() => {
      return null;
    });
  }
}
