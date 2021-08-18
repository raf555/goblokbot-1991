const db = require("@utils/database");
const { cekban } = require("@bot/utility");

module.exports = (parsed, event) => {
  var ff = db.open("db/ban.json");
  var ff2 = db.open("db/user.json");
  //var t = "";
  var c = 0;
  var isi = [];
  for (var i = 0; i < Object.keys(ff.get()).length; i++) {
    if (
      ff.get(Object.keys(ff.get())[i]) > 0 &&
      ff.get(Object.keys(ff.get())[i]) - Date.now() > 0
    ) {
      /*t +=
                  Object.keys(ff.get())[i] +
                  " " +
                  cekban(Object.keys(ff.get())[i])[1] +
                  " \n";*/
      isi.push({
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "• " + ff2.get(Object.keys(ff.get())[i]).name,
            size: "sm"
          },
          {
            type: "text",
            text: cekban(Object.keys(ff.get())[i])[1],
            size: "xxs"
          }
        ]
      });
      c += 1;
    }
  }
  var bbl = {
    type: "bubble",
    size: "micro",
    header: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "text",
          text: "Banned User(s) List",
          color: "#ffffff",
          align: "start",
          size: "sm",
          gravity: "center"
        },
        {
          type: "text",
          text: c + " orang",
          color: "#ffffff",
          align: "start",
          size: "xs",
          gravity: "center",
          margin: "lg"
        }
      ],
      backgroundColor: "#FF6B6E",
      paddingTop: "19px",
      paddingAll: "12px",
      paddingBottom: "16px"
    },
    body: {
      type: "box",
      layout: "vertical",
      contents: isi,
      spacing: "none",
      paddingAll: "12px"
    },
    styles: {
      footer: {
        separator: false
      }
    }
  };
  if (isi.length > 0) {
    //t = t.slice(0, -1);
    return {
      type: "flex",
      altText: "banned list",
      contents: bbl
    };
  } else {
    return { type: "text", text: "none" };
  }
};
