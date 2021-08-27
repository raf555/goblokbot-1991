const cheerio = require("cheerio");
const axios = require("axios");

module.exports = {
  data: {
    name: "Arknights Event Command",
    description: "Command buat ngirim info event Arknights",
    usage:
      "[@bot/!] akevent {options} [(list cn/list/upcoming)!/*]" +
      "\n\noptions:" +
      "\n--more ?: buat nampilin event page selanjutnya",
    CMD: "akevent",
    ALIASES: ["ake"]
  },
  run: akevent
};

async function akevent(parsed, event, bot) {
  let q = parsed.arg;

  if (q.toLowerCase() === "list cn") {
    return event_("cn", parsed.args);
  } else if (q.toLowerCase() === "list") {
    return event_("en", parsed.args);
  } else if (q.toLowerCase() === "upcoming") {
    return event_upcoming_en();
  }

  let url = "";
  let urls = await getlink();
  if (!q) {
    url = urls[0].url;
  } else {
    url = search(urls, q);
    if (url) {
      url = url.url;
    } else {
      return { type: "text", text: "Not found" };
    }
  }

  return gas(url).then(flex => ({
    type: "flex",
    altText: "AK - Event Rewards",
    contents: flex
  }));
}

function search(urls, q) {
  return urls.filter(data => data.name.match(new RegExp(q, "i")))[0] || null;
}

async function getlink() {
  let req = await Promise.all([
    get_event_data(
      "https://gamepress.gg/arknights/other/cn-event-and-campaign-list"
    ),
    get_event_data(
      "https://gamepress.gg/arknights/other/event-and-campaign-list"
    )
  ]);

  let cn = req[0];
  let en = req[1];

  return en
    .map(_ => ({ name: _.name, url: _.url }))
    .concat(cn.map(_ => ({ name: _.name, url: _.url })));
}

async function gas(urlz) {
  let url = urlz;
  let data = await getdata(url);

  let bubble1 = build_bubble(data.name, data.period, url, data.img);
  let bubble2 = makebubble2(data.data);
  let bubble3 = makebubble2([
    data.data[data.data.length - 2],
    data.data[data.data.length - 1],
    [],
    []
  ]);

  return {
    type: "carousel",
    contents: [bubble1, bubble2, bubble3]
  };
}

function makebubble2(data) {
  let bbl = {
    type: "bubble",
    size: "kilo",
    body: {
      type: "box",
      layout: "vertical",
      backgroundColor: "#000000",
      contents: [
        {
          type: "text",
          text: "Rewards",
          weight: "bold",
          size: "md",
          wrap: true,
          color: "#ffffff"
        },
        {
          type: "separator",
          margin: "sm",
          color: "#ffffff"
        }
      ]
    }
  };

  for (let i = 0; i < data.length - 2; i++) {
    let con = {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "text",
          text: data[i].name,
          size: "sm",
          color: "#ffffff",
          wrap: true
        }
      ],
      margin: "md"
    };

    let hor = createitemcon(data[i].data);
    hor.forEach(item => {
      con.contents.push(item);
    });

    bbl.body.contents.push(con);
    bbl.body.contents.push({
      type: "separator",
      margin: "sm",
      color: "#ffffff"
    });
  }

  return bbl;
}

function createitemcon(data) {
  let itemlen = data.length;
  let total = itemlen - (itemlen % 5) / 5 + 1;

  let out = [];
  for (let i = 0; i < total; i++) {
    out.push({
      type: "box",
      layout: "horizontal",
      contents: []
    });
  }

  data.forEach((item, i) => {
    let p = {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "image",
              url: item.img
            }
          ],
          width: "35px",
          height: "35px",
          offsetTop: "5px",
          offsetStart: "5px"
        }
      ],
      width: "45px",
      height: "45px"
    };
    if (!!item.bg) {
      p.contents.unshift({
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "image",
            url: item.bg
          }
        ],
        width: "45px",
        height: "45px",
        position: "absolute"
      });
    }
    if (!!item.qty) {
      p.contents.push({
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: item.qty,
            color: "#ffffff",
            size: "xxs"
          }
        ],
        backgroundColor: "#000000",
        position: "absolute",
        offsetBottom: "1px",
        offsetEnd: "5px"
      });
    }
    out[(i - (i % 5)) / 5].contents.push(p);
  });

  return out;
}

async function getdata(url) {
  let req = await axios.get(url);
  let $ = cheerio.load(req.data);
  let baseurl = "https://gamepress.gg";

  let name = $("#page-title")
    .find("h1")
    .text()
    .trim()
    .replace(/((\s-)?\sEvent\sPage)/, "");

  if (!name) {
    name = $("#page-title")
      .find("h1")
      .text()
      .replace(/((\s-)?\sCN\sEvent\sPage)/, "");
  }

  let period = (() => {
    $(".event-duration")
      .children()
      .remove();
    return $(".event-duration")
      .text()
      .trim();
  })();
  let img =
    baseurl +
    $(".og-image")
      .find("img")
      .attr("src");

  let summary = $(".field__item")
    .eq(0)
    .find("div.event-total-summary");

  let out = [];

  summary.each((i, elem) => {
    let data = $(summary[i]);
    let td = data.find("td");

    let out2 = {};

    let name = td
      .eq(0)
      .text()
      .trim();

    out2.name = name;
    out2.data = [];

    let rewards = td.eq(1).find("div.item-cell");

    rewards.each((i, elem) => {
      let datar = $(elem);

      let imgurl = baseurl + datar.find("img").attr("src");

      let style = $(elem).attr("style");
      let bgurl = "";
      if (!!style) {
        let bgstyle = /background-image: url\((.*?)\)/.exec(style);
        bgurl = baseurl + bgstyle[1];
      }

      let qty = datar
        .find("div.item-qty")
        .text()
        .trim();

      out2.data.push({
        img: imgurl,
        bg: bgurl,
        qty: qty
      });
    });

    out.push(out2);
  });

  return {
    name: name,
    period: period,
    img: img,
    data: out
  };
}

function build_bubble(name, period, url, imgurl) {
  return {
    type: "bubble",
    size: "kilo",
    hero: {
      type: "image",
      url: imgurl,
      size: "full",
      aspectRatio: "16:9",
      aspectMode: "cover",
      action: {
        type: "uri",
        uri: url
      }
    },
    body: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "text",
          text: name,
          weight: "bold",
          size: "md",
          wrap: true,
          action: {
            type: "uri",
            label: "action",
            uri: url
          }
        },
        {
          type: "text",
          text: period,
          size: "xs"
        }
      ]
    }
  };
}

async function event_(reg, args) {
  let start = 0;
  let n = 12;
  if (args.more) {
    n = 24;
    start = 12;
  }
  let url;
  if (reg === "cn") {
    url = "https://gamepress.gg/arknights/other/cn-event-and-campaign-list";
  } else {
    url = "https://gamepress.gg/arknights/other/event-and-campaign-list";
  }
  let data = await get_event_data(url, n);

  let bubble = [];

  for (let i = start; i < n; i++) {
    let data2 = data[i];
    if (data2.status === "Past") {
      break;
    }
    let name = data2.name;
    let url = data2.url;
    let imgurl = data2.imgurl;
    let period = data2.period;
    bubble.push(build_bubble2(name, period, url, imgurl));
  }

  return {
    type: "flex",
    altText: "Arknights EN Upcoming Event",
    contents: {
      type: "carousel",
      contents: bubble
    }
  };
}

async function event_upcoming_en() {
  let data = (await get_event_data(
    "https://gamepress.gg/arknights/other/event-and-campaign-list",
    1
  ))[0];

  let name = data.name;
  let url = data.url;
  let imgurl = data.imgurl;
  let period = data.period;

  if (Date.now() > new Date(period.end).getTime()) {
    return { type: "text", text: "None" };
  }

  return {
    type: "flex",
    altText: "Arknights EN Upcoming Event",
    contents: build_bubble2(name, period, url, imgurl)
  };
}

async function get_event_data(eventurl, n = -1) {
  let req = await axios.get(eventurl);
  let $ = cheerio.load(req.data);

  let table = $("#sort-table tbody tr");

  let out = [];

  let tabledata = table.each((i, elem) => {
    if (i === n) {
      return false;
    }

    let firstdata = $(elem);
    let td = firstdata.find("td");

    let status = td
      .eq(0)
      .find("div")
      .text()
      .trim();
    let time = td.eq(0).find("time");
    let period = {
      start: time
        .eq(0)
        .text()
        .trim(),
      end: time
        .eq(1)
        .text()
        .trim()
    };

    let baseurl = "https://gamepress.gg";

    let imgurl =
      baseurl +
      td
        .eq(1)
        .find("img")
        .attr("src");
    let url =
      baseurl +
      td
        .eq(1)
        .find("a")
        .attr("href");

    let name = td
      .eq(1)
      .find("a")
      .eq(1)
      .text()
      .trim()
      .replace(/((\s-)?\sEvent\sPage)/, "");

    if (!name) {
      name = td
        .eq(1)
        .find("a")
        .eq(0)
        .text()
        .trim()
        .replace(/((\s-)?\sCN\sEvent\sPage)/, "");
    }

    out.push({
      name: name,
      period: period,
      url: url,
      imgurl: imgurl,
      status: status
    });
  });

  return out;
}

function build_bubble2(name, period, url, imgurl) {
  return {
    type: "bubble",
    size: "kilo",
    hero: {
      type: "image",
      url: imgurl,
      size: "full",
      aspectRatio: "16:9",
      aspectMode: "cover",
      action: {
        type: "uri",
        uri: url
      }
    },
    body: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "text",
          text: name,
          weight: "bold",
          size: "md",
          wrap: true,
          action: {
            type: "uri",
            label: "action",
            uri: url
          }
        },
        {
          type: "text",
          text: period.start + " ~ " + period.end,
          size: "xs"
        }
      ]
    },
    footer: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "button",
          action: {
            type: "message",
            label: "Ingfokan",
            text: "!akevent " + name
          },
          style: "secondary"
        }
      ]
    }
  };
}
