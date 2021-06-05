const ud = require("urban-dictionary");

module.exports = (parsed, event) => {
  if (!parsed.arg) return null;
  var definition = parsed.arg;
  //console.log(ud)
  let echo;
  return ud.define(definition)
    .then(entries => {
      var kata = "";
      kata += entries[0].word;
      kata += "\n\n";
      kata += entries[0].definition;
      kata = kata.replace(/]/g, "");
      kata = kata.replace(/\[/g, "");
      return { type: "text", text: kata };
    })
    .catch(error => {
      console.error(error.message);
      return { type: "text", text: error.message };
    });
};
