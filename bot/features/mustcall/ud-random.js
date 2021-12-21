const axios = require("axios");
const cheerio = require("cheerio");

module.exports = {
  data: {
    name: "UrbanDictionary CMD",
    description: "Command buat ngecek definisi kata dari UD tapi random",
    usage: "[@bot/!] udr",
    CMD: "udr",
    ALIASES: []
  },
  run: async (parsed, event, bot) => {
    if (!parsed.arg) return null;
    var katax = parsed.arg;
    var url =
      "https://www.urbandictionary.com/define.php?term=" +
      encodeURIComponent(katax);
    let res = await axios.get(url);
    let body = res.data;
    var judul = new Array();
    var $ = cheerio.load(body);
    var kata = "";
    var meaning = "";
    var word = "";
    var arti = [];
    if ($.text().match(/Sorry, we couldn't find/i)) {
      kata = "Sorry, we couldn't find: " + katax;
    } else {
      $("div.def-panel").each(function(i, elm) {
        word = $(elm).children()[1].children[0].children[0]["data"];
        meaning = $(elm)
          .find("div.meaning")
          .text();
        judul.push(word + "\n\n" + meaning);
      });
    }
    return {
      type: "text",
      text: judul[angkaAcak(0, judul.length - 1)]
    };
  }
};

function angkaAcak(min, max) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
