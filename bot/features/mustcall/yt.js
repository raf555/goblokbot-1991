const { YTSearcher } = require("ytsearcher");
const ytsearcher = new YTSearcher(process.env.yts_api);

module.exports = {
  data: {
    name: "Youtube CMD",
    description: "Command buat nampilih top search dari Youtube",
    usage: "[@bot/!] yt <query>?",
    createdAt: 0,
    CMD: "yt",
    ALIASES: ["youtube"]
  },
  run: yt
};

async function yt(parsed, event, bot) {
  let random = parsed.args.random
  let txt = parsed.arg;
  let max = 10;
  let d = await ytsearcher.search(txt, { maxResults: random ? max : 1 });
  let i = random ? angkaAcak(0, max - 1) : 0;
  let bbl = {
    type: "bubble",
    size: "kilo",
    hero: {
      type: "image",
      url: d.currentPage[i].thumbnails.high.url,
      size: "full",
      aspectMode: "cover",
      aspectRatio: "16:9",
      action: {
        type: "uri",
        label: "action",
        uri: d.currentPage[i].url
      }
    },
    body: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "text",
          text: d.currentPage[i].title,
          weight: "bold",
          size: "xs",
          action: {
            type: "uri",
            label: "action",
            uri: d.currentPage[i].url
          }
        },
        {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: d.currentPage[i].channelTitle,
              color: "#8c8c8c",
              size: "xxs"
            }
          ]
        }
      ],
      spacing: "sm"
    }
  };
  return {
    type: "flex",
    altText: "Youtube Search",
    contents: bbl,
    sender: {
      name: "Youtube",
      iconUrl: "https://www.freepnglogos.com/uploads/youtube-logo-hd-8.png"
    }
  };
}

function angkaAcak(min, max) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
