const { ArgumentTypeError } = require("./exception");

module.exports = {
  BOOLEAN,
  NUMBER,
  STRING,
  DATE,
  ARRAY,
  JSON: _JSON
};

BOOLEAN.toString = () => "Boolean";
NUMBER.toString = () => "Number";
STRING.toString = () => "String";
DATE.toString = () => "Date";
ARRAY.toString = () => "Array";
_JSON.toString = () => "JSON";

function BOOLEAN(name, string, args) {
  return Boolean(string);
}

function NUMBER(name, string, args) {
  if (isNaN(string)) {
    throw new ArgumentTypeError(`Argument ${name} must be a valid number.`);
  }
  let num = Number(string);
  if (isNaN(num)) {
    throw new ArgumentTypeError(`Argument ${name} must be a valid number.`);
  }
  return num;
}

function STRING(name, string, args) {
  return String(string);
}

function DATE(name, string, args) {
  if (!isNaN(string)) {
    string = parseInt(string);
  }
  let date = new Date(string);
  if (date.toString() === "Invalid Date") {
    throw new ArgumentTypeError(
      `Argument ${name} must be a valid date format.`
    );
  }

  return date;
}

function ARRAY(name, string, args) {
  string = string.toString();
  let valid = null;
  try {
    let arr = JSON.parse(string);
    if (Array.isArray(arr)) {
      valid = arr;
    }
  } catch (e) {
  } finally {
    if (valid) return valid;
    let keys = Object.keys(args)
      .join(" ")
      .match(new RegExp(name + "\\d+", "g"));
    if (keys && keys.length) {
      let out = [];
      keys.forEach(key => {
        out.push(args[key]);
        delete args[key];
      });
      return out;
    } else {
      let split = string.split(",");
      return split;
    }
  }
}

function _JSON(name, string, args) {
  try {
    let json = JSON.parse(string);
    if (typeof json !== "object" || json === null) throw {};
    return json;
  } catch (e) {
    throw new ArgumentTypeError(
      `Argument ${name} must be a valid json format.`
    );
  }
}
