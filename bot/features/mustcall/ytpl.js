const axios = require("axios");

module.exports = async (parsed, event) => {
  let arg = parsed.arg;

  arg = arg
    .substring(1)
    .trim()
    .replace(/\s/g, "\n")
    .split("\n");

  let req = "https://ytplaylist-len.org/api/playlistId/";

  let key = [];
  arg.forEach(url => {
    let url2 = new URL(url);
    let param = new URLSearchParams(url2.search);
    key.push(param.get("list"));
  });

  let promises = [];
  key.forEach(id => {
    promises.push(
      axios.get(req + id).then(data => {
        return data.data.duration;
      })
    );
  });

  let tot = 0;

  let res = await Promise.all(promises);
  res.forEach(dur => {
    tot += dur;
  });

  return { type: "text", text: "total: " + tot + " s" };
};
