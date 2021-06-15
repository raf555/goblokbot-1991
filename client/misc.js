const app = require("express").Router();
const { convertTZ, pushMessage, dateTodate } = require("./../bot/utility");

app.get("/goblok", function(req, res) {
  res.send({ res: true });
});

app.get("/tes", function(req, res) {
  res.send(200);
});

app.post("/opm", async (req, res) => {
  let updated = req.body.chapters;

  if (req.body.source == "webcomic") {
    let text =
      "OPM ONE Raw Latest Update\n\nChapter: " +
      updated[0].chapter +
      "\nURL: " +
      updated[0].url;
    pushMessage(process.env.admin_id, {
      type: "text",
      text: text
    });
  } else if (req.body.source == "manga") {
    let carousel = {
      type: "carousel",
      contents: []
    };
    for (let i in updated) {
      let chapter = updated[i].chapter.toString();
      let thumb = updated[i].thumbnail;
      let burl = updated[i].url;
      let bdate = new Date(updated[i].timestamp).toString();
      carousel.contents.push({
        type: "bubble",
        size: "micro",
        hero: {
          type: "image",
          url: thumb,
          size: "full",
          aspectRatio: "16:9",
          action: {
            type: "uri",
            label: "action",
            uri: burl
          }
        },
        body: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text:
                "OPM Chapter - " +
                chapter +
                (updated[i].revision ? " - Revision" : ""),
              weight: "bold",
              size: "sm",
              wrap: true
            },
            {
              type: "text",
              text: dateTodate(convertTZ(new Date(bdate), "Asia/Jakarta")),
              size: "xxs",
              wrap: true
            }
          ]
        }
      });
    }
    await pushMessage(process.env.admin_id, {
      type: "flex",
      altText: "OPM New chapter",
      contents: carousel,
      sender: {
        name: "OPM Raw Update"
      }
    });
  }
  res.status(200).send(req.body);
});

module.exports = app;
