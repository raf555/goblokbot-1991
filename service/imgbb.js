const imgbbUploader = require("imgbb-uploader");

const key = process.env.imgbbkey;

module.exports = {
  upload: upload
};

function upload(options) {
  options.apiKey = key;
  if (options.name) {
    options.name = encodeURIComponent(options.name);
  }

  return imgbbUploader(options);
}
