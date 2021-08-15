const fs = require("fs");

module.exports = {
  data: {
    name: "Send CMD",
    description: "Command buat ngirim apa ae",
    usage: "[@bot/!] send [*/banlist/command/gblk]",
    createdAt: 0,
    CMD: "send",
    ALIASES: []
  },
  run: (parsed, event, bot) => {
    const table = getfeatures();
    let split = parsed.arg.split(" ");
    let arg = split[0].toLowerCase();

    if (!Object.keys(table).includes(arg)) {
      return { type: "text", text: parsed.arg };
    }

    let arg2 = split.splice(1, split.length).join(" ");
    parsed.arg = arg2;

    return table[arg](parsed, event);
  }
};

function getfeatures(onlyname = false) {
  const condition = name => {
    return name !== "index";
  };

  let list = {};

  let features = fs
    .readdirSync(__dirname + "/send/")
    .map(name => name.replace(".js", ""))
    .filter(name => condition(name));

  features.forEach(name => {
    if (!onlyname) {
      list[name] = require("./send/" + name);
    } else {
      list[name] = 1;
    }
  });

  return list;
}
