const app = require("express").Router({ caseSensitive: true });
const { convertTZ, pushMessage, dateTodate } = require("./../bot/utility");

app.post("/opm", async (req, res) => {
  let data = req.body;

  console.log(req.headers);
  console.log(data);

  if (data.type === "test") {
    res.status(200).json(data);
    return;
  }

  let updated = data.chapters;

  let key = req.headers["opmkey"];
  if (key && key === process.env.opmkey) {
    if (data.type === "update") {
      if (data.source == "webcomic") {
        let carousel = {
          type: "carousel",
          contents: []
        };
        for (let i in updated) {
          let chapter = updated[i].chapter.toString();
          let thumb = updated[i].thumbnail;
          let burl = updated[i].url;
          let pages = updated[i].pageLength;
          let bdate = new Date(updated[i].timestamp).toString();
          carousel.contents.push({
            type: "bubble",
            size: "micro",
            hero: {
              type: "image",
              url: thumb.replace("http", "https"),
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
                  text: "OPM ONE Chapter - " + chapter,
                  weight: "bold",
                  size: "sm",
                  wrap: true
                },
                {
                  type: "text",
                  text: pages + " pages.",
                  size: "xxs",
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
        await pushMessage(
          {
            type: "flex",
            altText: "OPM ONE New chapter",
            contents: carousel,
            sender: {
              name: "OPM ONE Raw Update"
            }
          },
          process.env.admin_id
        );
      } else if (data.source == "manga") {
        let carousel = {
          type: "carousel",
          contents: []
        };
        for (let i in updated) {
          let chapter = updated[i].chapter.toString();
          let thumb = updated[i].thumbnail;
          let burl = updated[i].url;
          let pages = updated[i].pageLength;
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
                  text: pages + " pages.",
                  size: "xxs",
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
        await pushMessage(
          {
            type: "flex",
            altText: "OPM New chapter",
            contents: carousel,
            sender: {
              name: "OPM Raw Update"
            }
          },
          process.env.admin_id
        );
      }
    }
  }
  res.status(200).json(data);
});

module.exports = app;
