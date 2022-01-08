const axios = require("axios");
const { angkaAcak } = require("@bot/utility");
const { ArgsType } = require("@bot/command/args");

module.exports = {
  data: {
    name: "One-Punch Man Command",
    description: "Command buat nampilin panel manga opm random",
    usage: "[@bot/!] opm <chapterno <pageno>?>?",
    CMD: "opm",
    ALIASES: [],
    ARGS: {
      chapter: {
        required: false,
        type: ArgsType.STRING
      },
      page: {
        required: false,
        type: ArgsType.STRING
      },
      "--raw": {}
    }
  },
  run: async (parsed, event, bot) => {
    let q = parsed.args.chapter;
    let n = parsed.args.page;

    let args = [parsed, q, n];
    let func = parsed.args.raw ? opmraw : opm;

    return func(...args);
  }
};

async function opmraw(parsed, q, n) {
  let data = await axios
    .get(
      "https://send-rss-get-json.herokuapp.com/convert/?u=https://tonarinoyj.jp/rss/series/13932016480028984490"
    )
    .then(r => r.data.items);

  let chapters = data.map(c => {
    let out = {};
    out.chapter = /\[第(.+)話\]/.exec(c.title)[1];
    out.link = c.link + ".json";
    return out;
  });

  if (q) {
    chapters = chapters.filter(c => c.chapter === q);
    if (chapters.length < 1) {
      throw new Error("Chapter " + q + " not found");
    }
  }

  let i1 = angkaAcak(0, chapters.length - 1);

  let chapterpage = await axios
    .get(chapters[i1].link, {
      headers: {
        "User-Agent": `Mozilla/5.0 (iPod; CPU iPhone OS 14_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/87.0.4280.163 Mobile/15E148 Safari/604.1`
      }
    })
    .then(r =>
      r.data.readableProduct.pageStructure.pages
        .filter(d => d.type === "main")
        .map(d => d.src)
    );

  let i2;
  if (n) {
    n = parseInt(n);
    if (n <= chapterpage.length) {
      i2 = parseInt(n) - 1;
    } else {
      throw new Error("Page " + n + " not found");
    }
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
        name: "OPM Chapter " + chapters[i1].chapter + "–" + (i2 + 1),
        iconUrl: "https://pbs.twimg.com/media/EXKhY6JWAAUmnJm.jpg"
      },
      quickReply: {
        items: [
          {
            type: "action",
            action: {
              type: "message",
              label: "More",
              text: "!opm --raw"
            }
          },
          {
            type: "action",
            action: {
              type: "message",
              label: "More from this chapt",
              text: "!opm --raw " + chapters[i1].chapter
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
        `Manga URL: https://cubari.moe/read/gist/OPM/${chapters[
          i1
        ].chapter.replace(/\./g, "-")}/${i2 + 1}/`,
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

async function opm(parsed, q, n) {
  let data = await axios
    .get(
      "https://gist.githubusercontent.com/funkyhippo/1d40bd5dae11e03a6af20e5a9a030d81/raw/?_" +
        Date.now()
    )
    .then(r => r.data.chapters);

  let chapters = Object.entries(data).map(c => {
    let out = {};
    out.chapter = c[0];

    let groups = c[1].groups;
    let chaptkey = Object.keys(groups)[0];

    out.pages = groups[chaptkey];
    out.title = c[1].title;

    return out;
  });

  if (q) {
    chapters = chapters.filter(c => c.chapter === q || c.title.toLowerCase().indexOf(q) !== -1);
    if (chapters.length < 1) {
      throw new Error("Chapter " + q + " not found");
    }
  }

  let i1 = angkaAcak(0, chapters.length - 1);

  let i2;
  if (n) {
    n = parseInt(n);
    if (n <= chapters[i1].pages.length) {
      i2 = parseInt(n) - 1;
    } else {
      throw new Error("Page " + n + " not found");
    }
  } else {
    i2 = angkaAcak(0, chapters[i1].pages.length - 1);
  }

  let url = chapters[i1].pages[i2];

  let msg = [
    {
      type: "image",
      originalContentUrl: url,
      previewImageUrl: url,
      sender: {
        name: "OPM Chapter " + chapters[i1].chapter + "–" + (i2 + 1),
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
          },
          {
            type: "action",
            action: {
              type: "message",
              label: "More from this chapt",
              text: "!opm " + chapters[i1].chapter
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
        `Manga URL: https://cubari.moe/read/gist/OPM/${chapters[
          i1
        ].chapter.replace(/\./g, "-")}/${i2 + 1}/`,
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
