const NewsAPI = require("newsapi");
const newsapi = new NewsAPI(process.env.newsapikey);

module.exports = {
  data: {
    name: "News Command",
    description: "Fitur buat nampilin berita terbaru",
    usage:
      "[@bot/!] news {options} <query>" +
      "\n\noptions:" +
      "\n--adv ?: advanced query" +
      "\n-c <country> ?: negara" +
      "\n-q <query> ?: query" +
      "\n-m <n> ?: max search" +
      "\n-cat <q> ?: category search" +
      "\n-from/-to <date> ?: (advanced) date query" +
      "\n-sortyby <type> ?: (advanced) sort news",
    CMD: "news",
    ALIASES: []
  },
  run: news
};

async function news(parsed, event, bot) {
  let custom = (parsed.args.advanced || parsed.args.adv || 0) === true;
  let search = !custom ? newsapi.v2.topHeadlines : newsapi.v2.everything;

  /* args */
  let country = parsed.args.country || parsed.args.c || "id";
  let query = parsed.arg || parsed.args.q || null;
  let max = parseInt(parsed.args.max || parsed.args.m || "12");
  let category = parsed.args.category || parsed.args.cat || null;

  let data = {
    country: country,
    pageSize: max
  };

  if (query) {
    data.q = query;
    delete data["pageSize"];
  }
  if (category) data.category = category;

  if (custom) {
    let from = parsed.args.from;
    if (todate(from)) data.from = from;

    let to = parsed.args.to;
    if (todate(to)) data.to = to;

    let sortby = parsed.args.sortby;
    if (sortby) data.sortBy = sortby;
  }

  let carousel = { type: "carousel", contents: [] };

  let searchdata = await search(data);

  if (searchdata.status === "ok") {
    searchdata.articles.forEach(article => {
      carousel.contents.push({
        type: "bubble",
        size: "kilo",
        hero: {
          type: "image",
          url:
            article.urlToImage ||
            "https://smkbinahusadapmk.sch.id/assets/imagesall/no-image-post.png",
          size: "full",
          aspectRatio: "16:9",
          aspectMode: "cover",
          action: {
            type: "uri",
            label: "action",
            uri: article.url
          }
        },
        body: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: article.title,
              weight: "bold",
              size: "sm",
              action: {
                type: "uri",
                label: "action",
                uri: article.url
              }
            },
            {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "text",
                  text: article.description || "No description available",
                  wrap: true,
                  color: "#8c8c8c",
                  size: "xs"
                }
              ]
            }
          ],
          spacing: "sm"
        },
        footer: {
          type: "box",
          layout: "horizontal",
          contents: [
            {
              type: "text",
              text: datetostr(new Date(article.publishedAt)),
              wrap: false,
              color: "#8c8c8c",
              size: "xs",
              flex: 5,
              align: "start"
            },
            {
              type: "text",
              text: article.source.name,
              wrap: false,
              color: "#8c8c8c",
              size: "xs",
              align: "end",
              flex: 5,
              action: {
                type: "uri",
                label: "action",
                uri: article.url
              }
            }
          ]
        }
      });
    });

    if (carousel.contents.length <= 0) {
      return { type: "text", text: "not found" };
    }

    return { type: "flex", altText: "news", contents: carousel };
  }

  return null;
}

function todate(str) {
  let regex = /(\d{2}|\d{1})-(\d{2}|\d{1})-(\d{4})/;
  let exec = regex.exec(str);

  if (exec) {
    str = `${exec[1]}-${exec[0]}-${exec[2]}`;
    let date = new Date(str);
    if (date == "Invalid Date") {
      return false;
    }
    return true;
  }
  return false;
}

function datetostr(date) {
  const padzero = num => ("0" + num).slice(-2);
  return `${padzero(date.getDate())}-${padzero(
    date.getMonth() + 1
  )}-${date.getFullYear()}`;
}
