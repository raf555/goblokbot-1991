const {
  ArgumentError,
  ArgumentTypeError,
  ArgumentConstraintError,
} = require("./exception");
const argstype = require("./type");

module.exports = {
  ArgsMiddleware: argsmiddleware,
  ArgsHelp: help,
  ArgsType: argstype,
};

/*
{
        alias: "alias",
        required: "boolean, true or false",
        type: argstype.type,
        description: "string of desc",
        default: "default value",
        constraints: [[func(value), errmsg]],
        require: array of string,
        modify: function(value),
        +: boolean | int,
        toArray: boolean // if +
}
*/

function parseRawParse(raw, parsed) {
  
}

function argsmiddleware(rules, parsed) {
  if (!rules) return;

  let args = parsed.args;
  let raw = parsed.rawParsed;
  let rules_args = Object.keys(rules);

  let i = 0;
  for (let name of rules_args) {
    let _ = false;
    let __ = false;
    let _name, _alias;
    if (!rules[name].alias) rules[name].alias = "";
    rules[name].type = argstype.decideType(rules[name].type);
    if (Boolean(rules[name]["+"]) && rules[name].toArray) {
      rules[name].type = argstype.ARRAY(rules[name].type);
    }

    if (name.startsWith("--") || rules[name].alias.startsWith("--")) {
      __ = true;
      _name = name.substring(2);
      _alias = rules[name].alias.substring(2);
    } else if (name.startsWith("-") || rules[name].alias.startsWith("-")) {
      _ = true;
      _name = name.substring(1);
      _alias = rules[name].alias.substring(1);
    } else {
      _name = name;
      _alias = rules[name].alias;
    }

    if (__) {
      let val = args[_name];
      delete args[_name];
      delete args[_alias];
      args[_name] =
        val ||
        (rules[name].default !== undefined
          ? rules[name].default === false
            ? false
            : true
          : false);
      continue;
    }

    if (_) {
      if (args[_name] !== undefined || args[_alias] !== undefined) {
        let string = args[_name] || args[_alias];
        delete args[_name];
        delete args[_alias];

        assigntype(_name, name, string, args, rules);
      } else {
        if (rules[name].default !== undefined) {
          assigntype(_name, name, rules[name].default, args, rules);
          continue;
        }
        if (rules[name].required) {
          throw new ArgumentError(`Argument ${name} is required.`);
        }
      }
      continue;
    }

    if (raw.length) {
      if (!raw[i]) {
        if (rules[name].default !== undefined) {
          assigntype(_name, name, rules[name].default, args, rules);
          i++;
          continue;
        } else if (rules[name].required) {
          throw new ArgumentError(`Argument ${name} is required.`);
        } else {
          i++;
          continue;
        }
      }
      if (rules[name]["+"]) {
        let inf = false;
        let last = -1;
        if (parseInt(rules[name]["+"])) {
          if (rules[name]["+"] < 0) {
            inf = true;
          } else if (rules[name]["+"] > 0) {
            if (i + rules[name]["+"] > raw.length) {
              inf = true;
            } else {
              last = i + rules[name]["+"];
            }
          }
        } else {
          if (Boolean(rules[name])) {
            inf = true;
          }
        }
        if (inf) {
          last = raw.length;
        }
        let str = raw.slice(i, last);
        if (!rules[name].toArray) {
          str = str.join(" ");
        }
        assigntype(_name, name, str, args, rules);
        if (inf) {
          i = raw.length - 1;
        } else {
          i += rules[name]["+"];
        }
      } else {
        assigntype(_name, name, raw[i], args, rules);
        i++;
      }
    } else {
      if (rules[name].default !== undefined) {
        assigntype(_name, name, rules[name].default, args, rules);
        i++;
        continue;
      }
      if (rules[name].required) {
        throw new ArgumentError(`Argument ${name} is required.`);
      }
    }
  }
}

function assigntype(_name, name, value, args, rules) {
  if (
    [argstype.NONE, argstype.NULL, argstype.UNDEFINED, argstype.NAN].includes(
      value
    )
  ) {
    value = value();
    rules[name].type = argstype.NOTYPE;
  }
  if (
    !Array.isArray(rules[name].type) &&
    typeof rules[name].type === "function"
  ) {
    checkrequiredargs(rules, args, name, _name);
    args[_name] = rules[name].type(_name, value, args);
    modifyarg(rules, args, name, _name);
    checkconstraint(rules, args, name, _name);
  } else {
    if (Array.isArray(rules[name].type)) {
      for (let i = 0, n = rules[name].type.length; i < n; i++) {
        try {
          checkrequiredargs(rules, args, name, _name);
          args[_name] = rules[name].type[i](_name, value, args);
          modifyarg(rules, args, name, _name);
          checkconstraint(rules, args, name, _name);
          break;
        } catch (e) {
          if (e.name === "ArgumentConstraintError") {
            throw e;
          }
          if (i === n - 1) {
            throw new ArgumentTypeError(
              `Argument ${name} must be a valid (${rules[name].type
                .map((f) => f.toString())
                .join(" | ")}) format.`
            );
          }
        }
      }
    }
  }
}

function checkrequiredargs(rules, args, name, _name) {
  if (!rules[name].require) return;

  function has(string) {
    string = string.toString().toLowerCase();
    if (string.startsWith("--")) {
      string = string.substring(2);
    } else if (string.startsWith("-")) {
      string = string.substring(1);
    }
    return Object.keys(args).indexOf(string) !== -1;
  }

  let require = rules[name].require;
  for (let i = 0, n = require.length; i < n; i++) {
    if (!has(require[i], copyArgs(args))) {
      throw new ArgumentConstraintError(
        `Argument ${name} requires following arguments: ${require.join(", ")}`
      );
    }
  }
}

function checkconstraint(rules, args, name, _name) {
  if (!rules[name].constraints) return;

  let constraints = rules[name].constraints;
  for (let i = 0, n = constraints.length; i < n; i++) {
    if (!constraints[i][0](args[_name], copyArgs(args))) {
      throw new ArgumentConstraintError(
        `Argument ${name} value must meet a condition: ${constraints[i][1]}`
      );
    }
  }
}

function modifyarg(rules, args, name, _name) {
  if (!rules[name].modify) return;

  let modify = rules[name].modify;
  let constraints = rules[name].constraints;
  if (modify && typeof modify === "function") {
    delete rules[name].modify;
    delete rules[name].constraints;
    try {
      assigntype(_name, name, modify(args[_name], copyArgs(args)), args, rules);
    } catch (e) {
      e.message = "Error while modifying argument: " + e.message;
      throw e;
    } finally {
      rules[name].modify = modify;
      rules[name].constraints = constraints;
    }
  }
}

function copyArgs(args) {
  return { ...args };
}

function help(parsed, event, { data, mustcall }) {
  let caller = "";
  if (mustcall) {
    caller = " [@bot / !]";
  }

  let args = data.ARGS;
  let args_positional = [];
  let args_positional_ = [];
  let args_not_positional = [];
  let args_not_positional_ = [];

  let a = {
    alias: "-a",
    required: false,
    type: "",
    help: "Enable arguments test mode",
    default: false,
  };

  if (args) {
    Object.keys(args).forEach((arg) => {
      let name = [];
      name.push(arg);
      if (args[arg].alias) name.push(args[arg].alias);
      if (arg.startsWith("--")) args[arg].type = argstype.BOOLEAN;
      args[arg].type = argstype.decideType(args[arg].type);
      let type = Array.isArray(args[arg].type)
        ? "(" + args[arg].type.map((f) => f.toString()).join(" | ") + ")"
        : args[arg].type.toString();
      let out = {
        name: name.join(", "),
        realname: name[0],
        desc: args[arg].description || "-",
        type,
        positional: !arg.startsWith("-"),
        default: args[arg].default || "-",
        required: args[arg].required || false,
        "+": args[arg]["+"]
      };
      if (out.positional) {
        args_positional.push(
          `<${
            out.realname /* + (out["+"] ? ` (+${out["+"] === true || out["+"] < 0 ? "Inf" : out["+"]})` : "")*/
          }>`
        );
        args_positional_.push(out);
      } else {
        args_not_positional_.push(out);
        if (arg.startsWith("--")) {
          args_not_positional.push("[" + out.realname + "]");
        } else {
          args_not_positional.push("[" + out.realname + " <val>]");
        }
      }
    });
  }

  args_not_positional_.sort(function (x, y) {
    return Boolean(x.required) === Boolean(y.required)
      ? 0
      : Boolean(x.required)
      ? -1
      : 1;
  });
  /*
  args_not_positional_.unshift({
    name: "--help, --h",
    desc: "Buat munculin pesan ini",
    type: "Boolean"
  });*/

  let pos_msg = args_positional_.map((d) => {
    return `•  ${d.name}
    Required: ${d.required ? "yes" : "no"}
    Description: ${d.desc}
    Data Type: ${d.type}
    Multiple Args: ${
      d["+"] ? `yes (${d["+"] === true || d["+"] < 0 ? "Inf" : d["+"]})` : "no"
    }
    Default Value: ${
      d.default === "-" || !d.default ? "-" : JSON.stringify(d.default)
    }`;
  });

  let not_pos_msg = args_not_positional_.map((d) => {
    return `•  ${d.name}
    Required: ${d.required ? "yes" : "no"}
    Description: ${d.desc}
    Data Type: ${d.type}
    Default Value: ${
      d.default === "-" || !d.default ? "-" : JSON.stringify(d.default)
    }`;
  });

  let message = `Usage:${caller} ${data.CMD} ${args_positional
    .concat(args_not_positional)
    .join(" ")}
Alias: ${data.ALIASES.join(" | ") || "-"}
Allowed Roles: ${
  data.ADMIN ? "Admin" :
    data.allowedRoles
      ? data.allowedRoles.length
        ? data.allowedRoles.join(", ")
        : "All Roles"
      : "All Roles"
  }

Name: ${data.name}
Description: ${data.description}

Positional Argument(s):
${pos_msg.length ? pos_msg.join("\n") : "-"}

Non-Positional Argument(s):
${not_pos_msg.length ? not_pos_msg.join("\n") : "-"}`;

  return {
    type: "text",
    text: message,
  };
}
