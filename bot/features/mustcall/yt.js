const { YTSearcher } = require("ytsearcher");
const ytsearcher = new YTSearcher(process.env.yts_api);

module.exports = {
  data: {
    name: "Youtube CMD",
    description: "Command buat nampilih top search dari Youtube",
    usage: "[@bot/!] yt <query>?",
    CMD: "yt",
    ALIASES: ["youtube"]
  },
  run: yt
};

async function yt(parsed, event, bot) {
  let random = parsed.args.random;
  let search = parsed.args.search;
  let txt = parsed.arg;
  let max = 12;
  let i = random ? angkaAcak(0, max - 1) : 0;

  if (search && parsed.args.n) {
    max = parseInt(parsed.args.n) % 12;
    if (max === 0) max = 1;
  }
  let d = await ytsearcher.search(txt, {
    maxResults: random || search ? max : 1
  });

  let out;
  if (!search) {
    out = makeytbubble(d.currentPage[i]);
  } else {
    out = {
      type: "carousel",
      contents: d.currentPage.map(makeytbubble)
    };
  }

  return {
    type: "flex",
    altText: "Youtube Search",
    contents: out,
    sender: {
      name: "Youtube",
      iconUrl: "https://www.freepnglogos.com/uploads/youtube-logo-hd-8.png"
    }
  };
}

function makeytbubble(data) {
  let thumb = data.thumbnails;
  let thumburl = (thumb.high || thumb.standard || thumb.default).url;

  let bbl = {
    type: "bubble",
    size: "kilo",
    hero: {
      type: "image",
      url: thumburl,
      size: "full",
      aspectMode: "cover",
      aspectRatio: "16:9",
      action: {
        type: "uri",
        label: "action",
        uri: data.url
      }
    },
    body: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "text",
          text: data.title,
          weight: "bold",
          size: "xs",
          action: {
            type: "uri",
            label: "action",
            uri: data.url
          }
        },
        {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: data.channelTitle,
              color: "#8c8c8c",
              size: "xxs"
            }
          ]
        }
      ],
      spacing: "sm"
    }
  };
  return bbl;
}

function angkaAcak(min, max) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
