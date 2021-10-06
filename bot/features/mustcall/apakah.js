const hash = require("@utils/hash");

module.exports = {
  data: {
    name: "Apakah",
    description: "Command buat nanya bot",
    usage: "[@bot/!] apakah <pertanyaan>",
    CMD: "apakah",
    ALIASES: []
  },
  run: apkh
};

function apkh(parsed, event, bot) {
  let arg = parsed.arg.toLowerCase();
  if (!arg) return null;
  if (sumChars(hash(arg)) % 2 == 0) {
    var apakah = "tidak";
  } else {
    var apakah = "iya";
  }
  return {
    type: "flex",
    altText: "apakah",
    contents: {
      type: "bubble",
      size: "micro",
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "box",
            layout: "horizontal",
            contents: [
              {
                type: "box",
                layout: "vertical",
                contents: [
                  {
                    type: "box",
                    layout: "horizontal",
                    contents: [
                      {
                        type: "box",
                        layout: "vertical",
                        contents: [],
                        width: "2px",
                        backgroundColor: "#B7B7B7"
                      }
                    ],
                    flex: 1
                  }
                ],
                width: "2px"
              },
              {
                type: "text",
                text: parsed.command + " " + parsed.arg,
                flex: 4,
                size: "sm",
                color: "#8c8c8c",
                align: "start",
                wrap: true
              }
            ],
            spacing: "lg"
          },
          {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "text",
                text: apakah,
                size: "sm"
              }
            ],
            margin: "md"
          }
        ]
      }
    }
  };
}
function sumChars(s) {
  var i = s.length,
    r = 0;
  while (--i >= 0) r += charToNumber(s, i);
  return r;
}

function charToNumber(s, i) {
  return parseInt(s.charCodeAt(i)) - 1;
}
