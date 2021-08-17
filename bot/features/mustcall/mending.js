module.exports = {
  data: {
    name: "Mending command",
    description: "Fitur buat nanya bot mending mana",
    usage: "[@bot/!] mending <query1> [apa/atau] <query2>",
    CMD: "mending",
    ALIASES: []
  },
  run: mending
};

function mending(parsed, event, bot) {
  if (!parsed.arg) return null;
  var mending = (parsed.arg + " ")
    .split("apa")
    .sort()
    .reverse();
  var mendingan = "" + mending[0] + " " + mending[1];
  let apakah;
  if (mending) {
    if (sumChars(mendingan) % 2 == 0) {
      apakah = mending[0];
    } else {
      apakah = mending[1];
    }
  }
  return {
    type: "flex",
    altText: "apkh",
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
