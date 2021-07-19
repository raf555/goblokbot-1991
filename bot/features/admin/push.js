const { isAdmin, pushMessage } = require("./../../utility");

module.exports = (parsed, event) => {
  if (!isAdmin(event.source.userId)) return false;
  pushMessage(
    {
      type: "text",
      text: parsed.arg,
      /*sender: {
        name: "Admin",
        iconUrl: "https://i.ibb.co/wp1gJ6k/Untitled.png"
      }*/
    },
    process.env.group_id
  );
};
