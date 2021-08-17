const malScraper = require("mal-scraper");

module.exports = {
  data: {
    name: "MAL Anime Search",
    description: "Command buat nyari anime dari MAL",
    usage: "[@bot/!] anime <query>",
    CMD: "anime",
    ALIASES: ["mal-search"]
  },
  run: anime
};

async function anime(parsed, event, bot) {
  if (!parsed.arg) return false;
  let data = await malScraper.getResultsFromSearch(parsed.arg);

  var umu = {
    type: "flex",
    altText: "Anime Search",
    sender: {
      name: "MyAnimeList",
      iconUrl:
        "https://cdn.myanimelist.net/img/sp/icon/apple-touch-icon-256.png"
    },
    contents: {
      type: "carousel",
      contents: [] //,
      //quickReply: qr
    }
  };
  for (var i = 0; i < (data.length > 5 ? 5 : data.length); i++) {
    var title = data[i].name;
    var thumb = data[i].thumbnail_url;
    var boble = {
      type: "bubble",
      size: "micro",
      hero: {
        type: "image",
        url: "" + thumb,
        size: "full",
        aspectMode: "cover",
        aspectRatio: "320:213"
      },
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "" + title,
            weight: "bold",
            size: "sm",
            wrap: true
          }
        ],
        spacing: "sm",
        paddingAll: "13px"
      },
      footer: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "separator"
          },
          {
            type: "text",
            text: "Detail",
            align: "center",
            size: "sm",
            margin: "lg",
            action: {
              type: "message",
              label: "action",
              text: "@bot mal " + title
            }
          }
        ]
      }
    };
    umu.contents.contents.push(boble);
  }
  const echo = {
    type: "text",
    text: "MAL is currenty unavailable.."
  };
  return umu;
}
