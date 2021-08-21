const editJsonFile = require("edit-json-file");

module.exports = {
  open: (path, options) => {
    let opt;
    let eol = { stringify_eol: true };
    if (options && Object.keys(options).length > 0) {
      opt = Object.assign(options, eol);
    } else {
      opt = eol;
    }

    return editJsonFile(path, options);
  }
};
