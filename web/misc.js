const app = require("express").Router({ caseSensitive: true });
const { convertTZ, pushMessage, dateTodate } = require("./../bot/utility");
const { createHmac, timingSafeEqual } = require("crypto");
const db = require("@utils/database");

app.post("/opm", validate, (req, res) => {
  let data = req.body;

  if (data.type === "error") {
    let _ = db.open("bot/assets/opmerr.json");
    let last = _.get("last");
    let now = Date.now();
    if (now >= last + 1800000) {
      _.set("last", now);
      _.save();
      pushMessage(
        {
          type: "text",
          text: data.message
        },
        process.env.admin_id
      );
    }
    res.status(200).json(data);
    return;
  }

  if (data.type === "update") {
    handleNewChapt(data.source, data.chapters); // your code here
    res.status(200).json(data);
    return;
  }

  res.status(400).json({ error: "bad request" });
});

/* Securing webhook as middleware (optional, BUT highly recommended) */
function validate(req, res, next) {
  console.log(req.headers);
  console.log(req.body);

  function securecompare(a, b) {
    if (a.length !== b.length) {
      return false;
    }
    return timingSafeEqual(a, b);
  }

  /* Signature Validation */
  function signaturevalidation() {
    let secret = process.env.opmsecret || ""; // your secret key
    let signature = req.headers["opm-signature-sha256"] || "";

    let signbuf = Buffer.from(signature, "base64");
    let mysign = createHmac("SHA256", secret)
      .update(JSON.stringify(req.body))
      .digest();

    return securecompare(signbuf, mysign);
  }

  /* Basic Authorization */
  function basicauth() {
    let mykey = process.env.opmkey; // your subscription key
    let key = req.headers["opmkey"];
    return key && key === mykey; // use string matching
  }

  /* if test event (registration), ignore validation */
  if (req.body.type === "test") {
    res.status(200).json(req.body);
    return;
  }

  /* these validation are optional,
  but highly recommended to use either one to secure the requests
  */
  if (signaturevalidation() && basicauth()) {
    next();
    return;
  }

  res.status(400).json({ error: "bad request" });
}

async function handleNewChapt(source, chapters) {
  if (source == "webcomic") {
    let carousel = {
      type: "carousel",
      contents: []
    };
    for (let i in chapters) {
      let chapter = chapters[i].chapter.toString();
      let thumb = chapters[i].thumbnail;
      let burl = chapters[i].url;
      let pages = chapters[i].pageLength;
      let bdate = new Date(chapters[i].timestamp).toString();
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
  } else if (source == "manga") {
    let carousel = {
      type: "carousel",
      contents: []
    };
    for (let i in chapters) {
      let chapter = chapters[i].chapter.toString();
      let thumb = chapters[i].thumbnail;
      let burl = chapters[i].url;
      let pages = chapters[i].pageLength;
      let bdate = new Date(chapters[i].timestamp).toString();
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
                (chapters[i].revision ? " - Revision" : ""),
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

module.exports = app;
