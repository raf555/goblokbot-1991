const { YTSearcher } = require("ytsearcher");
const { ArgsType } = require("@bot/command/args");
const db = require("@utils/database");

module.exports = {
  data: {
    name: "Youtube CMD",
    description: "Command buat nampilih top search dari Youtube",
    usage: "[@bot/!] yt <query>?",
    CMD: "yt",
    ALIASES: ["youtube"],
    ARGS: {
      "--random": {
        description: "Random mode",
      },
      "--search": {
        description: "Search mode",
      },
      "-n": {
        type: ArgsType.NUMBER,
        description: "Jumlah hasil search",
      },
    },
  },
  run: yt,
};

let yt_api = process.env.yts_api.split(",");

async function yt(parsed, event, bot) {
  const setting = db.open("bot/setting.json").get();
  const ytsearcher = new YTSearcher(yt_api[setting.ytsapi]);
  
  let random = parsed.args.random;
  let search = parsed.args.search;
  let txt = parsed.arg;
  let max = 12;
  let i = random ? angkaAcak(0, max - 1) : 0;

  if (search && parsed.args.n) {
    max = parsed.args.n;
    if (max === 0) max = 1;
  }
  let d = await ytsearcher.search(txt, {
    maxResults: random || search ? max : 1,
  });

  if (d.currentPage.length < 1) {
    return {
      type: "text",
      text: "0 result",
    };
  }

  let out;
  if (!search) {
    out = makeytbubble(d.currentPage[i]);
  } else {
    out = {
      type: "carousel",
      contents: d.currentPage.map(makeytbubble),
    };
  }

  return {
    type: "flex",
    altText: "Youtube Search",
    contents: out,
    sender: {
      name: "Youtube",
      iconUrl: "https://www.freepnglogos.com/uploads/youtube-logo-hd-8.png",
    },
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
        uri: data.url,
      },
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
            uri: data.url,
          },
        },
        {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: data.channelTitle,
              color: "#8c8c8c",
              size: "xxs",
            },
          ],
        },
      ],
      spacing: "sm",
    },
  };
  return bbl;
}

function angkaAcak(min, max) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
