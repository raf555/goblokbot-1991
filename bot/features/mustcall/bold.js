module.exports = {
  data: {
    name: "Bold cmd",
    description: "Fitur buat convert text jd bold",
    help: "",
    createdAt: 0,
    CMD: "bold",
    ALIASES: ["b"]
  },
  run: (parsed, event) => {
    if (!parsed.arg) return null;
    return {
      type: "text",
      text: boldkuy(parsed.arg)
    };
  }
};

function boldkuy(kata) {
  var tebal = [
    "𝐚",
    "𝐛",
    "𝐜",
    "𝐝",
    "𝐞",
    "𝐟",
    "𝐠",
    "𝐡",
    "𝐢",
    "𝐣",
    "𝐤",
    "𝐥",
    "𝐦",
    "𝐧",
    "𝐨",
    "𝐩",
    "𝐪",
    "𝐫",
    "𝐬",
    "𝐭",
    "𝐮",
    "𝐯",
    "𝐰",
    "𝐱",
    "𝐲",
    "𝐳",
    "𝐀",
    "𝐁",
    "𝐂",
    "𝐃",
    "𝐄",
    "𝐅",
    "𝐆",
    "𝐇",
    "𝐈",
    "𝐉",
    "𝐊",
    "𝐋",
    "𝐌",
    "𝐍",
    "𝐎",
    "𝐏",
    "𝐐",
    "𝐑",
    "𝐒",
    "𝐓",
    "𝐔",
    "𝐕",
    "𝐖",
    "𝐗",
    "𝐘",
    "𝐙"
  ];
  var angkab = ["𝟎", "𝟏", "𝟐", "𝟑", "𝟒", "𝟓", "𝟔", "𝟕", "𝟖", "𝟗", "𝟏𝟎"];
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
        katabaru += angkab[parseInt(kata[i])];
      } else if (kata[i].charCodeAt(0) - 97 >= 0) {
        katabaru += tebal[kata[i].charCodeAt(0) - 97];
      } else if (kata[i].charCodeAt(0) - 97 < 0) {
        katabaru += tebal[kata[i].charCodeAt(0) - 65 + 26];
      }
    }
  }
  return katabaru;
}
