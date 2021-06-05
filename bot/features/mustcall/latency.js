const db = require("./../../../service/database");

function arrsort(array, key) {
  return array.sort(function(a, b) {
    var x = a[key];
    var y = b[key];
    return x < y ? -1 : x > y ? 1 : 0;
  });
}

module.exports = (parsed, event) => {
  var usg = db.open(`db/latency.json`);
  var cust = db.open(`db/customcmd.json`);
  var usgdata = usg.get();
  var dp = [];
  for (var gk in usgdata) {
    if (/*gk == "tes" || */ !!cust.get(gk) && cust.get(gk).approved == 0)
      continue;
    dp.push({
      nama: gk,
      jumlah: parseInt(usgdata[gk].avg)
    });
  }
  dp = arrsort(dp, "jumlah");
  var boble = {
    type: "bubble",
    size: "micro",
    header: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "text",
          text: "Bot Latency",
          color: "#ffffff",
          align: "start",
          size: "md",
          gravity: "center"
        },
        {
          type: "text",
          text: "Top 3",
          size: "sm",
          color: "#ffffff"
        }
      ],
      backgroundColor: "#263238",
      paddingTop: "19px",
      paddingAll: "12px",
      paddingBottom: "16px"
    },
    body: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "separator"
        }
      ],
      spacing: "md",
      paddingAll: "12px"
    },
    footer: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "separator"
        },
        {
          type: "text",
          text: "View All",
          size: "sm",
          align: "center",
          color: "#9E9E9E",
          margin: "md",
          action: {
            type: "uri",
            label: "action",
            uri: "https://gblkbt1991.glitch.me/latency"
          }
        }
      ]
    },
    styles: {
      footer: {
        separator: false
      }
    }
  };
  var c = 0;
  for (var i = dp.length - 1; i > dp.length - 7; i--) {
    c += 1;
    if (c > 3) break;
    var datajson = {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "text",
          text: "" + dp[i].nama + ": " + dp[i].jumlah + " ms",
          size: "sm"
        }
      ]
    };
    boble.body.contents.push(datajson);
  }
  return {
    type: "flex",
    altText: "Bot Latency",
    contents: boble
  };
};
