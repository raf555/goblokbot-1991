const axios = require("axios");

const random = (arr, numonly = false) => {
  if (numonly) {
    return Math.floor(Math.random() * arr.length);
  }
  return arr[Math.floor(Math.random() * arr.length)];
};

module.exports = async (parsed, event) => {
  let s = parsed.arg.split(" ");
  let q = s.length > 0 ? s[0] : null;
  let n = s.length > 1 ? s[1] : null;

  let data = await axios.get(
    "https://gist.githubusercontent.com/funkyhippo/1d40bd5dae11e03a6af20e5a9a030d81/raw/?"
  );
  data = data.data.chapters;

  let chapters = Object.keys(data)
    .sort()
    .map(c => ({
      id: c,
      chapters: data[c].groups.GDrive
    }));

  if (q) {
    chapters = chapters.filter(c => c.id === q);
    if (chapters.length < 1) {
      return { type: "text", text: "Not found" };
    }
  }

  let i1 = random(chapters, true);
  let i2 = random(chapters[i1].chapters, true);
  if (n && parseInt(n) <= chapters[i1].chapters.length) {
    i2 = parseInt(n) - 1;
  }

  let url = chapters[i1].chapters[i2];

  //let t = await axios.get(
  //  `https://api.imgbb.com/1/upload?key=${
  //    process.env.imgbbkey
  //  }&image=${encodeURIComponent(url)}&expiration=${3600}`
  //);

  //url = t.data.data.url;

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

  //if (parsed.args.info) {
  let chapter = chapters[i1].id;
  let panel = i2 + 1;
  let chapterurlized = chapter.replace(/\./g, "-");

  msg.unshift({
    type: "text",
    text:
      `Taken from chapter ${chapter} panel ${panel}\n\n` +
      `IMG URL: ${url}\n` +
      `Manga URL: https://cubari.moe/read/gist/OPM/${chapterurlized}/${panel}`,
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
  //}

  return msg;
};
