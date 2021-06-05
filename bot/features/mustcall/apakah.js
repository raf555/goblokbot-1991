module.exports = (parsed, event) => {
  if (!parsed.arg) return null;
  if (sumChars(parsed.arg + " ") % 2 == 0) {
    var apakah = "tidak";
  } else {
    var apakah = "iya";
  }
  return { type: "text", text: apakah };
};
function sumChars(s) {
  var i = s.length,
    r = 0;
  while (--i >= 0) r += charToNumber(s, i);
  return r;
}

function charToNumber(s, i) {
  return parseInt(s.charCodeAt(i)) - 1;
}
