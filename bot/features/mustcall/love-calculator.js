const axios = require("axios");
const cheerio = require("cheerio");

module.exports = {
  data: {
    name: "Love Calculator Command",
    description: "Buat ngukur kecocokan cinta seseorang (lucu2an doang)",
    usage: "[@bot/!] lc <nama1> dan <nama2>",
    createdAt: 0,
    CMD: "lc",
    ALIASES: []
  },
  run: lc
};

async function lc(parsed, event, bot) {
  var st0 = parsed.arg;
  var st1 = st0.split(" dan ");
  var nama1 = st1[0].replace(" ", "+");
  var nama2 = st1[1].replace(" ", "+");
  var st = nama1 + "-and-" + nama2;
  var url = "http://lovecalculator.love/results/" + st;
  let res = await axios.get(url);
  let body = res.data;
  $ = cheerio.load(body);
  var echo = {
    type: "text",
    text:
      "Kecocokan antara " + nama1 + " dan " + nama2 + " = " + $("strong").text()
  };
  var echo3 = {
    type: "flex",
    altText: "Love Calculator uwu",
    contents: {
      type: "bubble",
      size: "nano",
      header: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "" + st1[0],
            size: "md",
            style: "italic",
            align: "center",
            color: "#ffffff"
          },
          {
            type: "text",
            text: "dan",
            color: "#ffffff",
            size: "xxs",
            align: "center"
          },
          {
            type: "text",
            text: "" + st1[1],
            size: "md",
            color: "#ffffff",
            style: "italic",
            align: "center"
          },
          {
            type: "text",
            text: $("strong").text(),
            color: "#ffffff",
            align: "start",
            size: "xs",
            gravity: "center",
            margin: "lg"
          },
          {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "box",
                layout: "vertical",
                contents: [
                  {
                    type: "filler"
                  }
                ],
                width: $("strong").text(),
                backgroundColor: "#F06292",
                height: "6px"
              }
            ],
            backgroundColor: "#9FD8E36E",
            height: "6px",
            margin: "sm"
          }
        ],
        backgroundColor: "#F48FB1"
      },
      styles: {
        footer: {
          separator: false
        }
      }
    }
  };
  return echo3;
}
