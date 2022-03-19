const { WebhookClient } = require("discord.js");
const webhookClient = new WebhookClient({
  url: process.env.discordcdn,
});
const dbUtil = require("./database");
const db = dbUtil.open("db/discordCDN.json");
let fileType = import("file-type").then((p) => (fileType = p));

module.exports = {
  uploadFile,
  createFile,
  getFile,
  deleteFile,
  getBufferOrStreamType
};

async function getBufferOrStreamType(bufferOrStream) {
  try {
    return await fileType.fileTypeFromBuffer(bufferOrStream);
  } catch (e) {
    return await fileType.fileTypeFromStream(bufferOrStream);
  }
}

function makeUploadResult(res) {
  let attachments = res.attachments.map((a) => {
    return {
      id: a.id,
      name: a.filename,
      url: a.url,
      proxy_url: a.proxy_url,
    };
  });
  return {
    id: res.id,
    file: attachments[0],
  };
}

async function deleteFile(id) {
  let data = getFile(id);
  if (!data || data.isDeleted) return;
  data = { isDeleted: true };
  editFile(id, data);
  return await webhookClient.deleteMessage(id).then((res) => undefined);
}

function getFile(idOrURL) {
  let data = db.get(idOrURL + "_");
  if (!data) {
    let all = Object.entries(db.get());
    data = all.find(d => !!d[1].file && (d[1].file.url === idOrURL || d[1].file.proxy_url === idOrURL));
    if (data) data = data[1];
  }
  if (data && data.isDeleted) return;
  return data;
}

function editFile(id, data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      id = id + "_";
      db.set(id, data);
      db.save();
      resolve();
    }, 100);
  });
}

async function createFile(name, bufferOrStream) {
  return {
    name: name + "." + (await getBufferOrStreamType(bufferOrStream)).ext,
    attachment: bufferOrStream,
  };
}

async function uploadFile(file, uploaderId = null) {
  if (!Array.isArray(file)) file = [file];
  try {
    let result = await webhookClient
      .send({
        files: file,
      })
      .then(makeUploadResult);
    editFile(result.id, {
      id: result.id,
      file: result.file,
      isDeleted: false,
      uploaderId,
    });
    return result;
  } catch (e) {
    console.error(e);
    throw new Error("Failed to upload files!");
  }
}
