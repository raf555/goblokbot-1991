//const axios = require("axios");
const Jimp = require("jimp");
const imgbb = require("./../../../service/imgbb");

module.exports = {
  data: {
    name: "Kyaa command",
    description: "Command buat generate gambar kyaa",
    usage: "kyaa <keywords>?",
    CMD: "kyaa",
    ALIASES: []
  },
  run: kyaa
};

async function kyaa(parsed, event, bot) {
  let arg = (() => {
    let msg = parsed.arg;
    if (!!msg) {
      msg = " " + msg;
    } else {
      msg = "";
    }
    return msg;
  })();

  let image = await Jimp.read({
    url:
      "https://cdn.glitch.com/1539d99f-e4fd-47a4-9564-a3b13e757dfa%2FUntitled.png?v=1621310548257"
  });
  let font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
  let kyaaimg = await image
    .print(
      font,
      0,
      0,
      {
        text: "Kyaa" + arg,
        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
        alignmentY: Jimp.VERTICAL_ALIGN_BOTTOM
      },
      image.bitmap.width,
      image.bitmap.height
    )
    .quality(50);

  let kyaabuffer = await kyaaimg.getBufferAsync(Jimp.MIME_PNG);

  let upload = await imgbb.upload({
    name: "kyaa" + arg,
    base64string: kyaabuffer.toString("base64"),
    expiration: 3600 * 24
  });
  let url = upload.url;
  return {
    type: "image",
    originalContentUrl: url,
    previewImageUrl: url
  };
}

/*
function getBase64(url) {
  return axios
    .get(url, {
      responseType: "arraybuffer"
    })
    .then(response => Buffer.from(response.data, "binary").toString("base64"));
}
*/
