const { getranks } = require("@bot/socialcredit");

module.exports = {
  data: {
    name: "Ranks Command",
    description: "Command buat nampilin leaderboard user",
    usage: "[@bot/!] ranks",
    CMD: "ranks",
    ALIASES: []
  },
  run: function(parsed, event, bot) {
    let ranks = getranks();

    let out = "";

    ranks.forEach((d, i) => {
      out += `#${i + 1} ${d.name} | Social credit: ${d.xp} | Level: ${
        d.level
      } | Messages: ${d.count}\n`;
    });

    return {
      type: "flex",
      contents: makecarousel(ranks),
      altText: "Social Credit Leaderboard"
    };
  }
};

function makecarousel(ranks) {
  let calc = a => (a - (a % 5)) / 5;
  let bblttl = calc(ranks.length);

  let cards = [];
  for (let i = 0; i <= bblttl; i++) {
    cards.push([]);
  }

  ranks.forEach((d, i) => {
    cards[calc(i)].push(makecard(d, i + 1));
  });

  let bubbles = cards.map(makebubble);

  return {
    type: "carousel",
    contents: bubbles
  };
}

function makebubble(d, i) {
  let base = {
    type: "bubble",
    body: {
      type: "box",
      layout: "vertical",
      contents: [],
      backgroundColor: "#000000",
      spacing: "sm"
    }
  };
  if (i === 0) {
    base.body.contents.push({
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "text",
          text: "Social Credit Leaderboard",
          weight: "bold",
          color: "#ffffff",
          align: "center",
          size: "lg"
        }
      ]
    });
  }
  d.forEach(card => base.body.contents.push(card));
  return base;
}

function makecard(d, rank) {
  let defimg =
    "https://cdn.glitch.com/6fe2de81-e459-4790-8106-a0efd4b2192d%2Fno-image-profile.png?v=1622879440349";
  let name = d.name || "NONAME"
  if (name.length > 17) {
    name = name.substring(0, 17) + "..";
  }
  
  return {
    type: "box",
    layout: "horizontal",
    contents: [
      {
        type: "text",
        text: "#" + rank,
        position: "absolute",
        size: "lg",
        weight: "bold",
        color: "#ffffff",
        offsetEnd: "4px"
      },
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
                layout: "vertical",
                contents: [
                  {
                    type: "image",
                    url: d.image || defimg,
                    size: "full"
                  }
                ],
                width: "64px",
                height: "64px",
                cornerRadius: "100px"
              }
            ],
            paddingAll: "5px",
            width: "75px",
            height: "75px"
          },
          {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "text",
                text: name,
                color: "#ffffff"
              },
              {
                type: "text",
                text: "Level: " + d.level,
                color: "#ffffff",
                size: "sm"
              },
              {
                type: "text",
                text: "Credit: " + numFormatter(d.xp),
                color: "#ffffff",
                size: "sm"
              }
            ],
            paddingAll: "5px",
            width: "200px"
          }
        ],
        paddingAll: "2px"
      }
    ],
    backgroundColor: "#212121"
  };
}

//https://stackoverflow.com/a/32638472
function numFormatter(num, fixed = 4) {
  if (num === null) {
    return null;
  } // terminate early
  if (num === 0) {
    return "0";
  } // terminate early
  fixed = !fixed || fixed < 0 ? 0 : fixed; // number of decimal places to show
  var b = num.toPrecision(2).split("e"), // get power
    k = b.length === 1 ? 0 : Math.floor(Math.min(b[1].slice(1), 14) / 3), // floor at decimals, ceiling at trillions
    c =
      k < 1
        ? num.toFixed(0 + fixed)
        : (num / Math.pow(10, k * 3)).toFixed(1 + fixed), // divide by power
    d = c < 0 ? c : Math.abs(c), // enforce -0 is 0
    e = d + ["", "K", "M", "B", "T"][k]; // append power
  return e.replace(/\./g, ",");
}
