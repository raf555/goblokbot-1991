const db = require("./../../../service/database");
const imageSearch = require("image-search-google");
const stringSimilarity = require("string-similarity");

// init
let papkey = process.env.pap_key.split(",");
let key1 = papkey[0];
let key2 = papkey[1];
let key3 = papkey[2];
let key4 = papkey[3];

let apikey = process.env.pap_api_key.split(",");
let api1 = apikey[0];
let api2 = apikey[1];
let api3 = apikey[2];
let api4 = apikey[3];

let key = [key1, key2, key3, key4];
let api = [api1, api2, api3, api4];

function invalidimage(he) {
  return (
    he.url.match(/x-raw-image:\/\/\//) ||
    he.thumbnail.match(/x-raw-image:\/\/\//)
  );
}

module.exports = (parsed, event) => {
  if (!parsed.arg) return false;

  const setting = db.open("bot/setting.json").get();
  let query = parsed.arg;

  // cek ban
  let dbz = db.open("db/banpap.json");
  let dbg = dbz.get();
  for (let i = 0; i < Object.keys(dbg).length; i++) {
    if (dbz.get(Object.keys(dbg)[i]) == 1) {
      let reg = new RegExp(Object.keys(dbg)[i], "i");
      let matches = stringSimilarity.findBestMatch(
        Object.keys(dbg)[i],
        parsed.arg.split(" ")
      );
      //if (query.match(reg) && dbz.get(Object.keys(dbg)[i]) == 1) {
      if (matches.bestMatch.rating >= 0.9) {
        return {
          type: "text",
          text:
            "Kata tersebut 「 " +
            Object.keys(dbg)[i] +
            " 」 telah di-ban oleh Admin"
        };
      }
    }
  }
  let klien = new imageSearch(key[setting.imgapi], api[setting.imgapi]);
  let gambar;
  let options = { page: 1 };
  return klien.search(encodeURIComponent(parsed.arg), options).then(he => {
    if (he.length === 0) {
      return {
        type: "text",
        text: "Not found"
      };
    }

    if (parsed.args.n) {
      let n = parsed.args.n;
      if (typeof n === "string") {
        n = parseInt(n) % 12;
      } else {
        n = 12;
      }

      let crsl = {
        type: "flex",
        altText: "pap",
        contents: {
          type: "carousel",
          contents: []
        }
      };

      for (let i = 0; i < Math.min(he.length, n); i++) {
        if (invalidimage(he[i])) {
          continue;
        }
        crsl.contents.contents.push({
          type: "bubble",
          size: "micro",
          hero: {
            type: "image",
            url: he[i].url.replace("http://", "https://"),
            size: "full",
            aspectMode: "fit",
            action: {
              type: "uri",
              uri: he[i].url.replace("http://", "https://")
            }
          }
        });
      }

      return crsl;
    }

    let xdlmao = Math.floor(Math.random() * he.length);

    if (parsed.args.t) {
      xdlmao = 0;
    }

    let tries = 0;

    while (invalidimage(he[xdlmao]) && tries < 10) {
      xdlmao = Math.floor(Math.random() * he.length);
      tries++;
    }

    //console.log(he)
    //console.log(he[xdlmao])

    gambar = he[xdlmao].url.replace("http://", "https://");
    let gambart = he[xdlmao].thumbnail.replace("http://", "https://");

    //console.log(gambar)
    let send = [
      {
        type: "image",
        originalContentUrl: gambar,
        previewImageUrl: gambart
      }
    ];
    if (parsed.args.out || parsed.args.url) {
      send.push({
        type: "text",
        text: gambar
      });
    }
    return send;
  });
};
