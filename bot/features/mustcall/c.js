const axios = require("axios");
const cheerio = require("cheerio");

module.exports = copid;

async function copid(parsed, event) {
  let res = await axios.get("https://www.worldometers.info/coronavirus/");
  let body = res.data;
  var $ = cheerio.load(body);
  var totalcases1 = "";
  var totaldeaths1 = "";
  var totalrecovered1 = "";
  var activecases1 = "";
  var totalcases2 = "";
  var totaldeaths2 = "";
  var totalrecovered2 = "";
  var activecases2 = "";
  var totalcasesdiff = "";
  var totaldeathsdiff = "";
  var totalrecovereddiff = "";
  var n = 0;
  $('td[style="font-weight: bold; font-size:15px; text-align:left;"]').each(
    function(i, elm) {
      if ($(elm).text() == "Indonesia") {
        n += 1;
        if (n == 1) {
          totalcases1 = $(elm)
            .next()
            .text()
            .replace(/,/g, "")
            .replace(/ /g, "");
          totaldeaths1 = $(elm)
            .next()
            .next()
            .next()
            .text()
            .replace(/,/g, "")
            .replace(/ /g, "");
          totalrecovered1 = $(elm)
            .next()
            .next()
            .next()
            .next()
            .next()
            .text()
            .replace(/,/g, "")
            .replace(/ /g, "");
          activecases1 = $(elm)
            .next()
            .next()
            .next()
            .next()
            .next()
            .next()
            .text()
            .replace(/,/g, "")
            .replace(/ /g, "");
        } else if (n == 2) {
          totalcases2 = $(elm)
            .next()
            .text()
            .replace(/,/g, "")
            .replace(/ /g, "");
          totaldeaths2 = $(elm)
            .next()
            .next()
            .next()
            .text()
            .replace(/,/g, "")
            .replace(/ /g, "");
          totalrecovered2 = $(elm)
            .next()
            .next()
            .next()
            .next()
            .next()
            .text()
            .replace(/,/g, "")
            .replace(/ /g, "");
          activecases2 = $(elm)
            .next()
            .next()
            .next()
            .next()
            .next()
            .next()
            .text()
            .replace(/,/g, "")
            .replace(/ /g, "");
        }
      }
      if (n == 2) return false;
    }
  );
  activecases1 =
    -1 *
    (parseInt(totalcases1) -
      parseInt(totaldeaths1) -
      parseInt(totalrecovered1));
  totalcasesdiff =
    parseInt(totalcases1.replace(/,/g, "")) -
    parseInt(totalcases2.replace(/,/g, ""));
  totalcasesdiff = number_format(totalcasesdiff, 0, ",", ".");
  totaldeathsdiff = parseInt(totaldeaths1) - parseInt(totaldeaths2);
  totaldeathsdiff = number_format(totaldeathsdiff, 0, ",", ".");
  totalrecovereddiff = parseInt(totalrecovered1) - parseInt(totalrecovered2);
  totalrecovereddiff = number_format(totalrecovereddiff, 0, ",", ".");
  totalcases1 = number_format(totalcases1, 0, ",", ".");
  totaldeaths1 = number_format(totaldeaths1, 0, ",", ".");
  totalrecovered1 = number_format(totalrecovered1, 0, ",", ".");
  activecases1 = number_format(activecases1, 0, ",", ".");
  totalcases2 = number_format(totalcases2, 0, ",", ".");
  totaldeaths2 = number_format(totaldeaths2, 0, ",", ".");
  totalrecovered2 = number_format(totalrecovered2, 0, ",", ".");
  activecases2 = number_format(activecases2, 0, ",", ".");
  if (!totalcases1) totalcases1 = "-";
  if (!totaldeaths1) totaldeaths1 = "-";
  if (!totalrecovered1) totalrecovered1 = "-";
  if (!activecases1) activecases1 = "-";
  if (!totalcases2) totalcases2 = "-";
  if (!totaldeaths2) totaldeaths2 = "-";
  if (!totalrecovered2) totalrecovered2 = "-";
  if (!activecases2) activecases2 = "-";
  if (!totalcasesdiff) totalcasesdiff = "-";
  if (!totaldeathsdiff) totaldeathsdiff = "-";
  if (!totalrecovereddiff) totalrecovereddiff = "-";
  const data = {
    type: "flex",
    altText: "Corona Update: Indonesia",
    sender: {
      name: "COVID-19 Update",
      iconUrl:
        "https://jacksonfreepress.media.clients.ellingtoncms.com/img/photos/2020/03/18/Coronavirus-banner2_cred-CDC_web_t670.jpg"
    },
    contents: {
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
            text: "Indonesia",
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
                    text: "" + totalcases1 + " (+" + totalcasesdiff + ")",
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
                    text:
                      "" + totalrecovered1 + " (+" + totalrecovereddiff + ")",
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
                    text: "" + totaldeaths1 + " (+" + totaldeathsdiff + ")",
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
                    text: "" + -1 * activecases1,
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
            contents: [
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
                    "https://www.worldometers.info/coronavirus/country/indonesia"
                }
              },
              {
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
              }
            ]
          }
        ]
      },
      styles: {
        footer: {
          separator: true
        }
      }
    }
  };
  return data;
  //}
}

function number_format(b, c, d, e) {
  b = (b + "").replace(/[^0-9+\-Ee.]/g, "");
  var n = !isFinite(+b) ? 0 : +b,
    prec = !isFinite(+c) ? 0 : Math.abs(c),
    sep = typeof e === "undefined" ? "," : e,
    dec = typeof d === "undefined" ? "." : d,
    s = "",
    toFixedFix = function(n, a) {
      var k = Math.pow(10, a);
      return "" + Math.round(n * k) / k;
    };
  s = (prec ? toFixedFix(n, prec) : "" + Math.round(n)).split(".");
  if (s[0].length > 3) {
    s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
  }
  if ((s[1] || "").length < prec) {
    s[1] = s[1] || "";
    s[1] += new Array(prec - s[1].length + 1).join("0");
  }
  return s.join(dec);
}
