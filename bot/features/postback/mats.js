const db = require("@utils/database");

module.exports = {
  data: {
    name: "Arknights Mats",
    description: "Command buat info material dari Arknights",
    usage: "-",
    createdAt: 0,
    CMD: "arknights-mats",
    ALIASES: ["akm", "mats"]
  },
  run: mats
};

function mats(data, event) {
  let pbdk = data;

  //console.log(pbdk[1])
  var yy = db.open("bot/assets/arknek/mats/mats-info.json");
  var yyy = yy.get();
  var item = db.open("bot/assets/arknek/items.json");
  var building = db.open("bot/assets/arknek/building.json");
  var itemid = "";
  var iscraftable = false;
  var formula = "";
  if (isNaN(pbdk[1])) {
    for (var i = 0; i < Object.keys(item.get().items).length; i++) {
      if (item.get().items[Object.keys(item.get().items)[i]].name == pbdk[1]) {
        itemid = Object.keys(item.get().items)[i];
        break;
      }
    }
  } else {
    itemid = pbdk[1];
  }
  if (!itemid || !item.get("items." + itemid)) {
    return null;
  }
  if (
    item.get("items." + itemid + ".name").match(/chip/i) ||
    item.get("items." + itemid + ".name").match(/lmd/i) ||
    item.get("items." + itemid + ".name").match(/exp/i)
  ) {
    return null;
  }
  if (item.get("items." + itemid).buildingProductList.length > 0) {
    iscraftable = true;
    formula = item.get("items." + itemid).buildingProductList[0].formulaId;
  }

  yyy.body.contents[1].text = item.get("items." + itemid + ".name");
  yyy.body.contents[0].contents[1].contents[0].url =
    "https://aceship.github.io/AN-EN-Tags/img/material/bg/item-" +
    (item.get("items." + itemid + ".rarity") + 1) +
    ".png";
  yyy.body.contents[0].contents[1].contents[1].url =
    "https://aceship.github.io/AN-EN-Tags/img/items/" +
    item.get("items." + itemid + ".iconId") +
    ".png";
  if (iscraftable) {
    var recipe = [
      building.get("workshopFormulas." + formula + ".goldCost"),
      []
    ];
    for (
      var i = 0;
      i < building.get("workshopFormulas." + formula + ".costs").length;
      i++
    ) {
      recipe[1].push([
        "https://aceship.github.io/AN-EN-Tags/img/material/bg/item-" +
          (item.get(
            "items." +
              building.get("workshopFormulas." + formula + ".costs")[i].id +
              ".rarity"
          ) +
            1) +
          ".png",
        "https://aceship.github.io/AN-EN-Tags/img/items/" +
          item.get(
            "items." +
              building.get("workshopFormulas." + formula + ".costs")[i].id +
              ".iconId"
          ) +
          ".png",
        building.get("workshopFormulas." + formula + ".costs")[i].count,
        building.get("workshopFormulas." + formula + ".costs")[i].id
      ]);
    }
    yyy.body.contents[2].contents[1].contents[0].contents[2].contents[0].text =
      "x" + recipe[0];
    for (var i = 0; i < recipe[1].length; i++) {
      var j = {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "image",
            url: recipe[1][i][0],
            position: "absolute"
          },
          {
            type: "image",
            url: recipe[1][i][1],
            action: {
              type: "postback",
              label: "action",
              data: "mats," + recipe[1][i][3]
            }
          },
          {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "text",
                text: "x" + recipe[1][i][2],
                color: "#ffffff",
                size: "xxs"
              }
            ],
            position: "absolute",
            backgroundColor: "#000000",
            offsetTop: "35px"
          }
        ],
        width: "50px",
        height: "50px",
        margin: "sm",
        offsetTop: "3px"
      };
      yyy.body.contents[2].contents[1].contents.push(j);
    }
  } else {
    yyy.body.contents[2].contents[1].contents.push({
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "text",
          text: "Uncraftable.",
          color: "#ffffff"
        }
      ],
      margin: "md",
      offsetTop: "20px"
    });
  }
  //console.log(JSON.stringify(yyy));
  var echo = {
    type: "flex",
    altText: "Arknights Material Info",
    contents: yyy,
    cmd: "pb_arknek_mats"
  };

  return Object.assign(echo, { nosave: true, cmd: "" });
}
