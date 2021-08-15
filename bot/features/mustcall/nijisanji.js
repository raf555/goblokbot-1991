const axios = require("axios");
const cheerio = require("cheerio");

let API_LIVE = "https://api.itsukaralink.jp/v1.2";
let API_LIVERS = "";

loadliversurl();

async function loadliversurl() {
  // https://www.nijisanji.jp/_next/data/8MVMjiycXBBHZJSkK4HKv/en/members
  let data = await axios
    .get("https://www.nijisanji.jp/en/members")
    .then(res => res.data);
  let $ = cheerio.load(data);

  let nextdata = JSON.parse(
    $("script#__NEXT_DATA__")
      .text()
      .trim()
  );

  API_LIVERS = `https://www.nijisanji.jp/_next/data/${nextdata.buildId}/en/members`;
}

module.exports = {
  data: {
    name: "Nijisanji Command",
    description:
      "Command buat nampilin live schedule (JP) atau liver Nijisanji",
    usage:
      "[@bot/!] nijisanji {options} [livers/liver]? <liver-name/live-title>?" +
      "\n\noptions:" +
      "\n--now ?: liat schedule mulai dr jam skrg" +
      "\n--past ?: liat schedule sblm jam skrg" +
      "\n--next ?: liat schedule/livers page selanjutnya" +
      "\n-page <n> ?: liat schedule/livers page n" +
      "\n-n <n> ?: liat schedule/livers dgn jumlah n" +
      "\n--desc ?: sort schedule/livers descending" +
      "\n--livers ?: liat livers" +
      "\n-livers [(jp/id/en/kr)/*] ?: liat livers dengan query" +
      "\n-sort-by [(subs/name/debut)](-[asc/desc])? ?: sort livers" +
      "\n-liver <name> ?: liat liver dgn suatu nama",
    createdAt: 0,
    CMD: "nijisanji",
    ALIASES: ["niji", "2434"]
  },
  run: (parsed, event, bot) => {
    let args = Object.keys(parsed.args);

    if (parsed.args.livers || /^(livers)(\s(.*))?/.test(parsed.arg)) {
      if (/^(livers)(\s(.*))?/.test(parsed.arg)) {
        let exec = /^(livers)(\s(.*))?/.exec(parsed.arg);
        parsed.args.livers = exec[3];
        parsed.arg = "";
      }
      return liver_list(parsed);
    }

    if (parsed.args.liver || /^(liver)(\s(.*))?/.test(parsed.arg)) {
      if (/^(liver)(\s(.*))?/.test(parsed.arg)) {
        let exec = /^(liver)(\s(.*))?/.exec(parsed.arg);
        parsed.args.liver = exec[3];
        parsed.arg = "";
      }
      return liver_info(parsed);
    }

    return live_schedule(parsed);
  }
};

async function live_schedule(parsed) {
  let data = await request(API_LIVE + "/events.json");
  let events = data.events;

  if (!!parsed.arg) {
    let id = await getLiverIdByName(parsed.arg);
    if (id === -1) {
      /*return {
        type: "text",
        text: "No liver found with query " + parsed.arg
      };*/
      events = events.filter(e =>
        e.name.match(new RegExp(parsed.arg.toLowerCase(), "i"))
      );
    } else {
      events = events.filter(e => e.livers[0].id === id);
    }
    if (parsed.args.now) {
      events = events.filter(
        e =>
          convertToWIB(e.start_date).getTime() >=
          convertToWIB(new Date()).getTime()
      );
    }
  } else {
    if (!parsed.args.past) {
      events = events.filter(
        e =>
          convertToWIB(e.start_date).getTime() >=
          convertToWIB(new Date()).getTime()
      );
    } else {
      events = events
        .filter(
          e =>
            /*convertToWIB(e.start_date).getTime() >=
              convertToWIB(toLocaleDate(new Date(), true)).getTime() &&*/
            convertToWIB(e.start_date).getTime() <=
            convertToWIB(new Date()).getTime()
        )
        .reverse();
    }
  }

  if (parsed.args.desc) {
    events = events.reverse();
  }

  let carousel = { type: "carousel", contents: [] };

  let page = Math.max(
    parseInt(Number(parsed.args.next) || parsed.args.page || "0"),
    0
  );

  if (page * 12 >= events.length) {
    return {
      type: "text",
      text: "No schedule found for page " + page
    };
  }

  for (let i = page * 12; i < Math.min(page * 12 + 12, events.length); i++) {
    carousel.contents.push(makeLiveBubble(events[i]));
  }

  if (parsed.args.n && !isNaN(parsed.args.n)) {
    carousel.contents = carousel.contents.slice(
      0,
      Math.min(parseInt(parsed.args.n), 12)
    );
  }

  return {
    type: "flex",
    altText: "Nijisanji Live Schedule",
    sender: {
      name: "Nijisanji",
      iconUrl:
        "https://pbs.twimg.com/profile_images/1335777549343883264/rVsyH8Jo.jpg"
    },
    contents: carousel
  };
}

async function liver_list(parsed) {
  let arg = parsed.args.livers;
  let q;

  if (typeof arg === "boolean") {
    q = parsed.arg;
  } else {
    q = arg;
  }

  let livers = await axios
    .get(API_LIVERS)
    .then(res => res.data.pageProps.livers);

  if (!!q) {
    let branch = /(nijisanji)?(\s?(jp|en|kr|id))/.exec(q.toLowerCase());
    if (branch) {
      q = branch[3].toUpperCase();
      if (q === "JP") {
        q = "にじさんじ";
      } else {
        q = "NIJISANJI " + q;
      }
      livers = livers.filter(l => l.affiliation[0] === q);
    } else {
      livers = livers.filter(
        l =>
          l.name.match(new RegExp(q, "i")) ||
          l.english_name.match(new RegExp(q, "i"))
      );
    }
  }

  let sortq = parsed.args["sort-by"] || "subs";
  let sort = /(name|debut|subs|subscriber)(-(asc|desc))?/.exec(sortq);
  if (!sort) {
    return { type: "text", text: "Invalid sort args" };
  }
  let by = sort[1];
  let order = sort[3];

  if (by === "name") {
    livers = livers.sort((a, b) =>
      a.english_name.localeCompare(b.english_name)
    );
  } else if (by === "debut") {
    livers = livers.sort((a, b) => {
      return new Date(a.debut_at).getTime() - new Date(b.debut_at).getTime();
    });
  } else if (by === "subs" || by === "subscriber") {
    livers = livers.sort((a, b) => {
      return a.subscribe_orders - b.subscribe_orders;
    });
  }
  if (order === "desc") livers = livers.reverse();
  if (parsed.args.desc) livers = livers.reverse();

  let carousel = { type: "carousel", contents: [] };

  let page = Math.max(
    parseInt(Number(parsed.args.next) || parsed.args.page || "0"),
    0
  );

  if (page * 12 >= livers.length) {
    return {
      type: "text",
      text: "No livers found for page " + page
    };
  }

  for (let i = page * 12; i < Math.min(page * 12 + 12, livers.length); i++) {
    carousel.contents.push(makeLiverBubble(livers[i]));
  }

  if (parsed.args.n && !isNaN(parsed.args.n)) {
    carousel.contents = carousel.contents.slice(
      0,
      Math.min(parseInt(parsed.args.n), 12)
    );
  }

  return {
    type: "flex",
    altText: "Nijisanji Livers - " + q,
    sender: {
      name: "Nijisanji",
      iconUrl:
        "https://pbs.twimg.com/profile_images/1335777549343883264/rVsyH8Jo.jpg"
    },
    contents: carousel
  };
}

async function liver_info(parsed) {
  let arg = parsed.args.liver;
  let q;

  if (typeof arg === "boolean") {
    q = parsed.arg;
  } else {
    q = arg;
  }

  if (!q) {
    return { type: "text", text: "Invalid query" };
  }

  q = q.toLowerCase();

  let livers = await axios
    .get(API_LIVERS)
    .then(res => res.data.pageProps.livers);

  livers = livers.filter(
    l =>
      l.slug === q ||
      l.name.match(new RegExp(q, "i")) ||
      l.english_name.match(new RegExp(q, "i"))
  );

  if (!livers.length) {
    return { type: "text", text: "Not found" };
  }

  let slug = livers[0].slug;

  let liverdata = await axios
    .get(`${API_LIVERS}/${slug}.json`)
    .then(res => res.data.pageProps.liver);

  liverdata.debut_at = livers[0].debut_at;

  let liver = liverdata;

  let carousel = { type: "carousel", contents: [] };
  carousel.contents.push(makeLiverBubble(liver, true));
  carousel.contents.push(makeLiverInfoBubble(liver));
  //carousel.contents.push(makeLiverInfoBubble(liver, true));

  return {
    type: "flex",
    altText: "Nijisanji Livers - " + liver.english_name,
    sender: {
      name: "Nijisanji",
      iconUrl:
        "https://pbs.twimg.com/profile_images/1335777549343883264/rVsyH8Jo.jpg"
    },
    contents: carousel
  };
}

async function getLiverIdByName(name) {
  let data = await getLiverDetailByName(name);
  return data ? data.liver.id : -1;
}

async function getLiverDetailByName(name) {
  name = name.toLowerCase();

  let data = await request(API_LIVE + "/livers.json");
  let livers = data.liver_relationships;

  let regex = new RegExp(name, "i");

  let filter = livers.filter(liver => {
    liver = liver.liver;
    return (
      liver.id.toString().match(regex) ||
      liver.name.match(regex) ||
      liver.furigana.match(regex) ||
      liver.english_name.match(regex)
    );
  });

  if (filter.length === 0) {
    return null;
  }

  return filter[0];
}

function request(url) {
  return axios.get(url).then(res => res.data.data);
}

function addzero(n) {
  if (typeof n === "string") {
    n = Number(n);
  }
  return n < 10 ? "0" + n : n;
}

function toLocaleClock(date) {
  return addzero(date.getHours()) + "." + addzero(date.getMinutes());
}

function toLocaleDate(date, r = false) {
  if (r) {
    return (
      addzero(date.getMonth() + 1) +
      "-" +
      addzero(date.getDate()) +
      "-" +
      addzero(date.getFullYear())
    );
  }
  return (
    addzero(date.getDate()) +
    "-" +
    addzero(date.getMonth() + 1) +
    "-" +
    addzero(date.getFullYear())
  );
}

function convertToWIB(date) {
  let tzString = "Asia/Jakarta";
  return new Date(
    (typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", {
      timeZone: tzString
    })
  );
}

function makeLiveBubble(event) {
  let thumbnail = event.thumbnail;
  let url = event.url;
  let title = event.name;
  let ava = event.livers[0].avatar;
  let color = event.livers[0].color;
  let liver_name = event.livers[0].name;
  let liver_id = event.livers[0].id;
  let datewib = convertToWIB(event.start_date);
  let time = toLocaleClock(datewib);
  let istoday = datewib.getDate() === convertToWIB(new Date()).getDate();
  let offsettime = istoday ? "14px" : "5px";

  let timearr = [
    {
      type: "text",
      text: time + " WIB",
      size: "sm"
    }
  ];

  if (!istoday) {
    timearr.unshift({
      type: "text",
      text: toLocaleDate(datewib),
      size: "sm"
    });
  }

  return {
    type: "bubble",
    size: "kilo",
    hero: {
      type: "image",
      url: thumbnail,
      size: "full",
      aspectMode: "fit",
      aspectRatio: "16:9",
      action: {
        type: "uri",
        label: "action",
        uri: url
      }
    },
    body: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: title,
              size: "sm",
              weight: "bold"
            }
          ],
          action: {
            type: "uri",
            label: "action",
            uri: url
          }
        },
        {
          type: "separator",
          margin: "sm"
        },
        {
          type: "box",
          layout: "horizontal",
          contents: [
            {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "image",
                  url: ava
                }
              ],
              width: "50px",
              height: "50px",
              cornerRadius: "100px",
              backgroundColor: color
            },
            {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "text",
                  text: liver_name,
                  weight: "bold"
                }
              ],
              offsetTop: "12px"
            },
            {
              type: "box",
              layout: "vertical",
              contents: timearr,
              offsetTop: offsettime
            }
          ],
          spacing: "10px",
          margin: "md"
        }
      ]
    }
  };
}

function makeLiverBubble(liver, socmed = false) {
  let ava = liver.images.halfbody.url;
  let imageintro = liver.images.splash_background.url;
  let affiliation = liver.affiliation[0];
  let debut = toLocaleDate(new Date(liver.debut_at));
  let color = liver.color_pattern.primaryColor;
  let name_en = liver.english_name;
  let name_jp = liver.name;

  let action;

  if (socmed) {
    action = [
      {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "image",
            url:
              "https://lh3.googleusercontent.com/proxy/MVffNfhLeU1DoFbsGEdSyzE1nlvwtSglCnUghbi11ojL30FnTAlwXmhiwtURvmS6SmaiFMsOaDSG2hUHjwj3RuIn7c6hAdU",
            aspectRatio: "5:2",
            offsetTop: "8px",
            offsetStart: "0px"
          }
        ],
        width: "25px",
        height: "25px",
        backgroundColor: "#ff0000",
        cornerRadius: "100px",
        action: {
          type: "uri",
          label: "action",
          uri: liver.social_links.youtube
        }
      },
      {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "image",
            url:
              "https://iconsplace.com/wp-content/uploads/_icons/ffffff/256/png/twitter-icon-18-256.png",
            aspectRatio: "3.5:2",
            offsetTop: "5.5px",
            offsetStart: "0px"
          }
        ],
        width: "25px",
        height: "25px",
        backgroundColor: "#1da1f1",
        cornerRadius: "100px",
        action: {
          type: "uri",
          label: "action",
          uri: liver.social_links.twitter
        }
      }
    ];
  } else {
    action = [
      {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "image",
            url: "https://image.flaticon.com/icons/png/512/68/68213.png",
            aspectRatio: "5:2",
            offsetTop: "8px",
            offsetStart: "0px"
          }
        ],
        width: "25px",
        height: "25px",
        cornerRadius: "100px",
        borderColor: "#000000",
        borderWidth: "light",
        action: {
          type: "message",
          text: "!niji -liver " + liver.slug
        }
      }
    ];
  }

  return {
    type: "bubble",
    size: "micro",
    body: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "image",
                  url: imageintro,
                  size: "full"
                }
              ],
              offsetStart: "40px",
              offsetBottom: "2px"
            },
            {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "text",
                  text: affiliation,
                  size: "xxs",
                  weight: "bold"
                },
                {
                  type: "text",
                  text: debut,
                  size: "xxs",
                  weight: "bold"
                }
              ],
              position: "absolute",
              offsetEnd: "5px",
              offsetBottom: "0px"
            }
          ],
          backgroundColor: "#ffffff",
          cornerRadius: "md"
        },
        {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "image",
                  url: ava,
                  aspectRatio: "10:15"
                }
              ],
              width: "50px",
              height: "50px",
              backgroundColor: color,
              cornerRadius: "100px"
            },
            {
              type: "text",
              text: name_en,
              weight: "bold",
              size: "sm",
              margin: "sm"
            },
            {
              type: "text",
              text: name_jp,
              size: "xxs"
            }
          ],
          position: "absolute",
          paddingTop: "11px",
          offsetStart: "10px"
        },
        {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "box",
              layout: "horizontal",
              contents: action,
              spacing: "sm"
            }
          ],
          position: "absolute",
          offsetBottom: "7px",
          offsetStart: "10px"
        }
      ],
      paddingAll: "3px",
      backgroundColor: color
    }
  };
}

function makeLiverInfoBubble(liver, youtube = false) {
  let fullbody = liver.images.fullbody.url;
  let imageintro = liver.images.splash_background.url;
  let color = liver.color_pattern.primaryColor;

  let out = {
    type: "bubble",
    size: "micro",
    body: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "image",
                  url: imageintro,
                  size: "full"
                }
              ],
              offsetStart: "40px",
              offsetBottom: "2px"
            }
          ],
          backgroundColor: "#ffffff",
          cornerRadius: "md"
        },
        {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "image",
                  url: fullbody,
                  size: "full",
                  offsetEnd: "40px"
                }
              ]
            }
          ],
          position: "absolute",
          offsetTop: "4px"
        }
      ],
      paddingAll: "3px",
      backgroundColor: color,
      action: {
        type: "uri",
        label: "action",
        uri: "https://www.nijisanji.jp/en/members/" + liver.slug
      }
    }
  };

  if (!youtube) {
    return out;
  }
  return out;

  /*

  return {
    type: "bubble",
    size: "micro",
    body: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "image",
                  url: imageintro,
                  size: "full"
                }
              ],
              offsetStart: "40px",
              offsetBottom: "2px"
            }
          ],
          backgroundColor: "#ffffff",
          cornerRadius: "md"
        },
        {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "image",
                  url: "https://i.ytimg.com/vi/Ndp6PhT-vlQ/hqdefault.jpg",
                  size: "full",
                  aspectRatio: "16:9"
                }
              ]
            },
            {
              type: "text",
              text:
                "月ノ美兎「ウラノミト」MV（1stアルバム「月の兎はヴァーチュアルの夢をみる」収録曲）",
              size: "sm",
              weight: "bold",
              margin: "sm"
            }
          ],
          position: "absolute",
          offsetTop: "25px",
          paddingAll: "2px",
          action: {
            type: "uri",
            label: "action",
            uri: "http://linecorp.com/"
          }
        }
      ],
      paddingAll: "3px",
      backgroundColor: color
    }
  };*/
}
