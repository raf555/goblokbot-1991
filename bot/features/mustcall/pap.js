const db = require("./../../../service/database");
const imageSearch = require("image-search-google");
const stringSimilarity = require("string-similarity");

module.exports = (parsed, event) => {
  if (!parsed.arg) return false;
  
  const setting = db.open("bot/setting.json").get();
  var query = parsed.arg;

  // cek ban
  var dbz = db.open("db/banpap.json");
  var dbg = dbz.get();
  for (var i = 0; i < Object.keys(dbg).length; i++) {
    if (dbz.get(Object.keys(dbg)[i]) == 1) {
      var reg = new RegExp(Object.keys(dbg)[i], "i");
      var matches = stringSimilarity.findBestMatch(
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

  // init
  var papkey = process.env.pap_key.split(",");
  var key1 = papkey[0];
  var key2 = papkey[1];
  var key3 = papkey[2];
  var key4 = papkey[3];

  var apikey = process.env.pap_api_key.split(",");
  var api1 = apikey[0];
  var api2 = apikey[1];
  var api3 = apikey[2];
  var api4 = apikey[3];

  var key = [key1, key2, key3, key4];
  var api = [api1, api2, api3, api4];
  var klien = new imageSearch(key[setting.imgapi], api[setting.imgapi]);
  var gambar;
  var options = { page: 1 };
  return klien.search(parsed.arg, options).then(he => {
    var xdlmao = Math.floor(Math.random() * he.length);
    //console.log(he[xdlmao])
    gambar = he[xdlmao].url;
    var gambart = he[xdlmao].thumbnail;
    //console.log(gambar)
    let send = [
      {
        type: "image",
        originalContentUrl: gambar,
        previewImageUrl: gambart
      }
    ];
    /*
          if (
            event.source.userId == "U3e3a9f7e8233d7fd2f58815690ee2cd4" &&
            (/saya/g.test(txt) ||
              /hiyama/g.test(txt) ||
              (/saya/g.test(txt) && /hiyama/g.test(txt)))
          ) {
            send.unshift({
              type: "flex",
              contents: {
                type: "bubble",
                size: "micro",
                body: {
                  type: "box",
                  layout: "vertical",
                  contents: [
                    {
                      type: "image",
                      url:
                        "https://stickershop.line-scdn.net/stickershop/v1/sticker/344658642/android/sticker.png;compress=true",
                      size: "full",
                      aspectMode: "cover"
                    }
                  ]
                }
              },
              altText: "Simp"
            });
          }*/
    return send;
  });
};
