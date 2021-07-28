const fs = require("fs");

const table = getfeatures();

module.exports = {
  data: {
    name: "Send CMD",
    description: "Command buat ngirim apa ae",
    help: "",
    createdAt: 0,
    CMD: "send",
    ALIASES: []
  },
  run: (parsed, event, bot) => {
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
    .readdirSync(__dirname)
    .map(name => name.replace(".js", ""))
    .filter(name => condition(name));

  features.forEach(name => {
    if (!onlyname) {
      list[name] = require("./" + name);
    } else {
      list[name] = 1;
    }
  });

  return list;
}
