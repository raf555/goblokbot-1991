const { YTSearcher } = require("ytsearcher");
const ytsearcher = new YTSearcher(process.env.yts_api);

module.exports = {
  data: {
    name: "Youtube Search",
    description: "Command buat nyari video dari YT",
    help: "",
    createdAt: 0,
    CMD: "yts",
    ALIASES: ["youtube-search"]
  },
  run: yts
};

async function yts(parsed, event, bot) {
  let txt = parsed.arg;

  let crsl = {
    type: "carousel",
    contents: []
  };

  let max = 10;
  if (parsed.args.m) {
    max = parseInt(parsed.args.m) % 12;
  }
  let d = await ytsearcher.search(txt, { maxResults: max });
  for (let i = 0; i < d.currentPage.length; i++) {
    crsl.contents.push({
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
    });
  }
  return {
    type: "flex",
    altText: "Youtube Search",
    contents: crsl,
    sender: {
      name: "Youtube",
      iconUrl: "https://www.freepnglogos.com/uploads/youtube-logo-hd-8.png"
    }
  };
}
