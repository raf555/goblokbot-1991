module.exports = {
  data: {
    name: "Italic cmd",
    description: "Command buat convert text jadi italic",
    usage: "[@bot/!] italic <query>",
    createdAt: 0,
    CMD: "italic",
    ALIASES: []
  },
  run: (parsed, event, bot) => {
    if (!parsed.arg) return null;
    return {
      type: "text",
      text: italikuy(parsed.arg)
    };
  }
};

function italikuy(kata) {
  var italik = [
    "𝘢",
    "𝘣",
    "𝘤",
    "𝘥",
    "𝘦",
    "𝘧",
    "𝘨",
    "𝘩",
    "𝘪",
    "𝘫",
    "𝘬",
    "𝘭",
    "𝘮",
    "𝘯",
    "𝘰",
    "𝘱",
    "𝘲",
    "𝘳",
    "𝘴",
    "𝘵",
    "𝘶",
    "𝘷",
    "𝘸",
    "𝘹",
    "𝘺",
    "𝘻",
    "𝘈",
    "𝘉",
    "𝘊",
    "𝘋",
    "𝘌",
    "𝘍",
    "𝘎",
    "𝘏",
    "𝘐",
    "𝘑",
    "𝘒",
    "𝘓",
    "𝘔",
    "𝘕",
    "𝘖",
    "𝘗",
    "𝘘",
    "𝘙",
    "𝘚",
    "𝘛",
    "𝘜",
    "𝘝",
    "𝘞",
    "𝘟",
    "𝘠",
    "𝘡"
  ];
  var angkak = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
  var katabaru = "";
  for (var i = 0; i < kata.length; i++) {
    if (kata[i] == " ") {
      katabaru += " ";
    } else if (kata[i] == ".") {
      katabaru += ".";
    } else if (kata[i] == ",") {
      katabaru += ",";
    } else if (kata[i] == ")") {
      katabaru += ")";
    } else if (kata[i] == "(") {
      katabaru += "(";
    } else if (kata[i] == "-") {
      katabaru += "-";
    } else {
      if (Number.isInteger(parseInt(kata[i]))) {
        katabaru += angkak[parseInt(kata[i])];
      } else if (kata[i].charCodeAt(0) - 97 >= 0) {
        katabaru += italik[kata[i].charCodeAt(0) - 97];
      } else if (kata[i].charCodeAt(0) - 97 < 0) {
        katabaru += italik[kata[i].charCodeAt(0) - 65 + 26];
      }
    }
  }
  return katabaru;
}
