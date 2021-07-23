const db = require("./../../../service/database");

function arrsort(array, key) {
  return array.sort(function(a, b) {
    var x = a[key];
    var y = b[key];
    return x < y ? -1 : x > y ? 1 : 0;
  });
}

module.exports = {
  data: {
    name: "Latency Command",
    description: "Buat ngirim latency fitur bot",
    help: "",
    createdAt: 0,
    CMD: "latency",
    ALIASES: []
  },
  run: lat
};

function lat(parsed, event) {
  var usg = db.open(`db/latency.json`);
  var cust = db.open(`db/customcmd.json`);
  var usgdata = usg.get();
  var dp = [];
  for (var gk in usgdata) {
    dp.push({
      nama: gk,
      jumlah: parseInt(usgdata[gk].avg)
    });
  }
  dp = arrsort(dp, "jumlah");
  let tot = parseInt(parsed.args.n) || 3;
  if (parsed.args.a) {
    dp = dp.reverse();
  }
  let q = parsed.args.q || parsed.arg;
  if (q) {
    dp = dp.filter(data => data.nama === q);
    tot = dp.length;
  }
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
          text: "Top " + tot,
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
  let j = 0;
  for (var i = dp.length - 1; i > -1; i--, j++) {
    if (j == tot) {
      break;
    }
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
}
