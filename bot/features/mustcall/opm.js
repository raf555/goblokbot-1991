const axios = require("axios");
const cheerio = require("cheerio");
const { angkaAcak } = require("@bot/utility");

module.exports = {
  data: {
    name: "One-Punch Man Command",
    description: "Command buat nampilin panel manga opm random",
    usage: "[@bot/!] opm <chapterno <pageno>?>?",
    CMD: "opm",
    ALIASES: []
  },
  run: async (parsed, event, bot) => {
    let s = parsed.arg.split(" ");
    let q = s.length > 0 ? s[0] : null;
    let n = s.length > 1 ? s[1] : null;

    let data = await axios
      .get("https://catmanga.org/api/series/opm")
      .then(r => r.data.chapters);

    let chapters = data.map(c => ({
      chapter: c.number.toString(),
      title: c.title
    }));

    if (q) {
      chapters = chapters.filter(c => c.chapter === q);
      if (chapters.length < 1) {
        return { type: "text", text: "Not found" };
      }
    }

    let i1 = angkaAcak(0, chapters.length - 1);

    let chapterdata = await axios
      .get("https://catmanga.org/series/opm/" + chapters[i1].chapter)
      .then(r => r.data);
    let chapterpage = JSON.parse(
      cheerio
        .load(chapterdata)("#__NEXT_DATA__")
        .text()
    ).props.pageProps.pages;

    let i2;
    if (n && parseInt(n) <= chapterpage.length) {
      i2 = parseInt(n) - 1;
    } else {
      i2 = angkaAcak(0, chapterpage.length - 1);
    }

    let url = chapterpage[i2];

    let msg = [
      {
        type: "image",
        originalContentUrl: url,
        previewImageUrl: url,
        sender: {
          name: "OPM Random Panel",
          iconUrl: "https://pbs.twimg.com/media/EXKhY6JWAAUmnJm.jpg"
        },
        quickReply: {
          items: [
            {
              type: "action",
              action: {
                type: "message",
                label: "More",
                text: "!opm"
              }
            }
          ]
        }
      }
    ];

    if (parsed.args.info) {
      let chapter = chapters[i1].chapter;
      let panel = i2 + 1;

      msg.unshift({
        type: "text",
        text:
          `Taken from chapter ${chapter} panel ${panel}\n\n` +
          `IMG URL: ${url}\n` +
          `Manga URL: https://catmanga.org/series/opm/${chapter}#${panel}`,
        sender: {
          name: "OPM Random Panel",
          iconUrl: "https://pbs.twimg.com/media/EXKhY6JWAAUmnJm.jpg"
        },
        quickReply: {
          items: [
            {
              type: "action",
              action: {
                type: "message",
                label: "More",
                text: "!opm"
              }
            }
          ]
        }
      });
    }

    return msg;
  }
};
