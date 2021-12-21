const db = require("@utils/database");
const { pushMessage } = require("@bot/utility");
const axios = require("axios");

module.exports = async () => {
  try {
    let req = await axios.get(
      "https://dosbg3xlm0x1t.cloudfront.net/images/items/9784088830025/1200/9784088830025.jpg"
    );
    let a = db.open("bot/assets/opmerr.json");
    let cover = a.get("cover");
    if (!cover) {
      a.set("cover", true);
      a.save();
      pushMessage(
        {
          type: "text",
          text:
            "https://books.shueisha.co.jp/items/contents.html?isbn=978-4-08-883002-5"
        },
        process.env.admin_id
      );
    }
  } catch (e) {}
};
