const wiki = require("wikipedia");

module.exports = async (parsed, event) => {
  let lang = parsed.args.lang || "id";
  try {
    await wiki.setLang(lang);
  } catch (e) {
    return { type: "text", text: "Language code invalid" };
  }

  let summary;

  if (!parsed.arg) {
    summary = await wiki.random();
  } else {
    try {
      let page = await wiki.page(parsed.arg, { autoSuggest: !!parsed.args.as });
      summary = await page.summary();
    } catch (e) {
      return { type: "text", text: e.message };
    }
  }
  if (summary.title.match(/Not found/i)) {
    return { type: "text", text: "Not found" };
  }

  /*
  let bubble = {
    type: "flex",
    altText: "Wikipedia - " + summary.title,
    sender: {
      name: "Wikipedia",
      iconUrl:
        "https://pbs.twimg.com/profile_images/882177323914543104/NysA35sg_400x400.jpg"
    },
    contents: {
      type: "bubble",
      size: "micro",
      hero: {
        type: "image",
        url: summary.originalimage.source,
        size: "full",
        action: {
          type: "uri",
          label: "action",
          uri: summary.content_urls.desktop.page
        }
      }
    }
  };
  let text = {
    type: "text",
    text: summary.title + "\n\n" + summary.extract,
    sender: {
      name: "Wikipedia",
      iconUrl:
        "https://pbs.twimg.com/profile_images/882177323914543104/NysA35sg_400x400.jpg"
    }
  };
*/

  return {
    type: "flex",
    altText: "Wikipedia - " + summary.title,
    sender: {
      name: "Wikipedia",
      iconUrl:
        "https://pbs.twimg.com/profile_images/882177323914543104/NysA35sg_400x400.jpg"
    },
    contents: {
      type: "bubble",
      hero: {
        type: "image",
        url: summary.originalimage
          ? summary.originalimage.source
          : "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/600px-No_image_available.svg.png",
        size: "xl",
        action: {
          type: "uri",
          label: "action",
          uri: summary.content_urls.desktop.page
        }
      },
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: summary.title,
            size: "lg",
            weight: "bold",
            action: {
              type: "uri",
              label: "action",
              uri: summary.content_urls.desktop.page
            }
          },
          {
            type: "text",
            text: summary.extract, //wrap(summary.extract, parsed.args.nolimit, parsed.args.limit),
            wrap: true,
            size: "sm"
          }
        ]
      }
    }
  };
};

function wrap(text, nolimit, limit) {
  if (!nolimit) {
    text = text.match(/.{1,500}/)[0] + "...";
  }
  return text;
}
