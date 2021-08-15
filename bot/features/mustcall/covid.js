const axios = require("axios");
const cheerio = require("cheerio");

module.exports = {
  data: {
    name: "Corona cmd",
    description: "Command buat ngecek kasus corona",
    usage: "[@bot/!] [c/covid] <nama-negara>?",
    createdAt: 0,
    CMD: "c",
    ALIASES: ["covid"]
  },
  run: copid
};

async function copid(parsed, event, bot) {
  let res = await axios.get("https://www.worldometers.info/coronavirus/");
  let body = res.data;
  let $ = cheerio.load(body);

  let country = parsed.arg || parsed.args.c;
  if (!country) {
    country = "indonesia";
  }
  country = country.toLowerCase();

  let today = $("#main_table_countries_today tbody tr").filter(function() {
    let c = $(this)
      .find("td")
      .eq(1)
      .text()
      .trim()
      .toLowerCase();
    return c.match(new RegExp(country)) || c === country;
  });

  let today_td = $(today[0]).find("td");

  let cname = today_td
    .eq(1)
    .text()
    .trim();

  if (!cname) {
    return { type: "text", text: "not found" };
  }

  let today_total = today_td
    .eq(2)
    .text()
    .trim()
    .replace(/,/g, ".");
  let today_newc = today_td
    .eq(3)
    .text()
    .trim()
    .replace(/,/g, ".");

  let today_death = today_td
    .eq(4)
    .text()
    .trim()
    .replace(/,/g, ".");
  let today_newd = today_td
    .eq(5)
    .text()
    .trim()
    .replace(/,/g, ".");

  let today_recover = today_td
    .eq(6)
    .text()
    .trim()
    .replace(/,/g, ".");
  let today_newr = today_td
    .eq(7)
    .text()
    .trim()
    .replace(/,/g, ".");

  let today_active = today_td
    .eq(8)
    .text()
    .trim()
    .replace(/,/g, ".");

  let footer = [
    {
      type: "text",
      text: "Source (EN)",
      color: "#aaaaaa",
      size: "xs",
      align: "start",
      action: {
        type: "uri",
        label: "Source",
        uri:
          "https://www.worldometers.info/coronavirus/country/" +
          encodeURIComponent(country)
      }
    }
  ];
  if (country === "indonesia") {
    footer.push({
      type: "text",
      text: "Source (ID)",
      color: "#aaaaaa",
      size: "xs",
      align: "end",
      action: {
        type: "uri",
        label: "Source",
        uri: "https://kawalcovid19.id/"
      }
    });
  }
  let out = {
    cmd: "covid",
    type: "flex",
    altText: "Corona Update: " + cname,
    sender: {
      name: "COVID-19 Update",
      iconUrl:
        "https://jacksonfreepress.media.clients.ellingtoncms.com/img/photos/2020/03/18/Coronavirus-banner2_cred-CDC_web_t670.jpg"
    },
    contents: makeBubble({
      cname,
      today_total,
      today_newc,
      today_recover,
      today_newr,
      today_death,
      today_newd,
      today_active,
      footer
    })
  };
  return out;
}

function makeBubble(data) {
  let {
    cname,
    today_total,
    today_newc,
    today_recover,
    today_newr,
    today_death,
    today_newd,
    today_active,
    footer
  } = data;
  return {
    type: "bubble",
    body: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "text",
          text: "COVID-19",
          weight: "bold",
          color: "#D50000",
          size: "sm"
        },
        {
          type: "text",
          text: cname,
          weight: "bold",
          size: "xxl",
          margin: "md"
        },
        {
          type: "separator",
          margin: "xxl"
        },
        {
          type: "box",
          layout: "vertical",
          margin: "xxl",
          spacing: "sm",
          contents: [
            {
              type: "box",
              layout: "horizontal",
              contents: [
                {
                  type: "text",
                  text: "Total Cases",
                  size: "sm",
                  color: "#111111",
                  flex: 0
                },
                {
                  type: "text",
                  text: today_total + " (" + (today_newc || "+0") + ")",
                  size: "sm",
                  color: "#111111",
                  align: "end"
                }
              ]
            },
            {
              type: "box",
              layout: "horizontal",
              contents: [
                {
                  type: "text",
                  text: "Total Recovered",
                  size: "sm",
                  color: "#388E3C",
                  flex: 0
                },
                {
                  type: "text",
                  text: today_recover + " (" + (today_newr || "+0") + ")",
                  size: "sm",
                  color: "#388E3C",
                  align: "end"
                }
              ]
            },
            {
              type: "box",
              layout: "horizontal",
              contents: [
                {
                  type: "text",
                  text: "Total Deaths",
                  size: "sm",
                  color: "#D50000",
                  flex: 0
                },
                {
                  type: "text",
                  text: today_death + " (" + (today_newd || "+0") + ")",
                  size: "sm",
                  color: "#D50000",
                  align: "end"
                }
              ]
            },
            {
              type: "box",
              layout: "horizontal",
              contents: [
                {
                  type: "text",
                  text: "Active Cases",
                  size: "sm",
                  flex: 0,
                  color: "#FBC02D"
                },
                {
                  type: "text",
                  text: today_active,
                  align: "end",
                  size: "sm",
                  color: "#FBC02D"
                }
              ]
            }
          ]
        },
        {
          type: "separator",
          margin: "xxl"
        },
        {
          type: "box",
          layout: "horizontal",
          margin: "md",
          contents: footer
        }
      ]
    },
    styles: {
      footer: {
        separator: true
      }
    }
  };
}
