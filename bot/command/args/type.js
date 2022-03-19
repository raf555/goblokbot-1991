const { ArgumentTypeError, ArgumentError } = require("./exception");

module.exports = {
  BOOLEAN,
  NUMBER,
  STRING,
  DATE,
  ARRAY,
  JSON: _JSON,
  decideType,
  NULL,
  NONE,
  UNDEFINED,
  NAN
};

BOOLEAN.toString = () => "Boolean";
NUMBER.toString = () => "Number";
STRING.toString = () => "String";
DATE.toString = () => "Date";
ARRAY.toString = () => "Array";
_JSON.toString = () => "JSON";
NULL.toString = () => "Null value";
NONE.toString = () => "Empty string";
UNDEFINED.toString = () => "Undefined value";
NAN.toString = () => "NaN value";
NOTYPE.toString = () => "No Type";

function decideType(type) {
  if (!type) return STRING;
  if (type.recurrentArray) return type;
  if (Array.isArray(type)) {
    return type.map(t => decideType(t));
  }
  switch (type) {
    case Boolean:
    case BOOLEAN:
      return BOOLEAN;
    case Number:
    case NUMBER:
      return NUMBER;
    case String:
    case STRING:
      return STRING;
    case Date:
    case DATE:
      return DATE;
    case Array:
    case ARRAY:
      return ARRAY;
    case JSON:
    case _JSON:
      return _JSON;
    default: return STRING;
  }
}

function NONE() {
  return "";
}

function NULL() {
  return null;
}

function UNDEFINED() {
  return undefined;
}

function NAN() {
  return NaN;
}

function NOTYPE(name, string, args) {
  return string;
}

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

function _JSON(name, string, args) {
  try {
    let json = JSON.parse(string);
    if (typeof json !== "object" || json === null) throw {};
    return json;
  } catch (e) {
    throw new ArgumentTypeError(`Argument ${name} must be a valid JSON.`);
  }
}

function ARRAY() {
  if (
    (arguments.length === 1) &
    (typeof arguments[0] === "function" || Array.isArray(arguments[0]))
  ) {
    let func = arguments[0];
    let func2 = function(name, string, args) {
      return toArray(name, string, args, func);
    };
    if (Array.isArray(func)) {
      func = func.map(t => decideType(t));
    } else {
      func = decideType(func);
    }
    let tostr = Array.isArray(func) ? `Array[${func.join(", ")}]` : `Array(${func})`;
    func2.toString = () => tostr;
    func2.recurrentArray = true;

    return func2;
  }
  let [name, string, args] = arguments;
  string = string.toString();
  return toArray(name, string, args);
}

function toArray(name, string, args, type = null) {
  if (Array.isArray(string)) return string;
  let valid = null;
  try {
    let arr = JSON.parse(string);
    if (Array.isArray(arr)) {
      valid = arr;
      if (type) {
        if (typeof type === "function") {
          for (let i = 0, n = valid.length; i < n; i++) {
            try {
              valid[i] = type(name, valid[i], args);
            } catch (e) {
              throw new ArgumentTypeError(
                `Argument ${name} at index ${i} must be a valid ${type} format.`
              );
            }
          }
        } else {
          if (type.length > valid.length) {
            throw new ArgumentError(
              `Argument ${name} must have atleast ${type.length} items.`
            );
          }
          for (let i = 0, n = valid.length; i < n; i++) {
            if (Array.isArray(valid[i]) || typeof valid[i] === "object") {
              valid[i] = JSON.stringify(valid[i]);
            }
            try {
              valid[i] = (type[i] || STRING)(name, valid[i], args);
            } catch (e) {
              throw new ArgumentTypeError(
                `Argument ${name} at index ${i} must be a valid ${type[i]} format.`
              );
            }
          }
        }
      }
    }
  } catch (e) {
    if (
      type &&
      (e.name === "ArgumentTypeError" || e.name === "ArgumentError")
    ) {
      throw e;
    }
  }
  if (valid) return valid;
  let regex = new RegExp(name + "(\\d+)", "g");
  let keys = Object.keys(args)
    .join(" ")
    .match(regex);
  if (keys && keys.length) {
    let out = [];
    keys.forEach(key => {
      let regex = new RegExp(name + "(\\d+)", "g");
      let exec = regex.exec(key);
      let i = parseInt(exec[1]);
      out[i] = args[key];
      delete args[key];
    });
    if (type) {
      if (typeof type === "function") {
        for (let i = 0, n = out.length; i < n; i++) {
          if (out[i] === undefined) continue;
          try {
            out[i] = type(name, out[i], args);
          } catch (e) {
            throw new ArgumentTypeError(
              `Argument ${name} at index ${i} must be a valid ${type} format.`
            );
          }
        }
      } else {
        if (type.length > out.length) {
          throw new ArgumentError(
            `Argument ${name} must have atleast ${type.length} items.`
          );
        }
        for (let i = 0, n = out.length; i < n; i++) {
          try {
            out[i] = (type[i] || STRING)(name, out[i], args);
          } catch (e) {
            throw new ArgumentTypeError(
              `Argument ${name} at index ${i} must be a valid ${type[i]} format.`
            );
          }
        }
      }
    }
    return out;
  } else {
    let split = string.split(",");
    if (type) {
      if (typeof type === "function") {
        for (let i = 0, n = split.length; i < n; i++) {
          try {
            split[i] = type(name, split[i], args);
          } catch (e) {
            throw new ArgumentTypeError(
              `Argument ${name} at index ${i} must be a valid ${type} format.`
            );
          }
        }
      } else {
        if (type.length > split.length) {
          throw new ArgumentError(
            `Argument ${name} must have atleast ${type.length} items.`
          );
        }
        for (let i = 0, n = split.length; i < n; i++) {
          try {
            split[i] = (type[i] || STRING)(name, split[i], args);
          } catch (e) {
            throw new ArgumentTypeError(
              `Argument ${name} at index ${i} must be a valid ${type[i]} format.`
            );
          }
        }
      }
    }
    return split;
  }
}
