const {
  ArgumentError,
  ArgumentTypeError,
  ArgumentConstraintError
} = require("./exception");
const argstype = require("./type");

module.exports = { argsmiddleware, help };

/*
{
        alias: "-a",
        required: false,
        type: argstype.BOOLEAN,
        description: "Enable arguments test mode",
        default: false
}
*/

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
    if (!rules[name].type) rules[name].type = argstype.STRING;

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
      delete args[_name];
      delete args[_alias];
      args[_name] =
        rules[name].default !== undefined
          ? rules[name].default === false
            ? false
            : true
          : true;
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
          args[_name] = rules[name].default;
          continue;
        }
        if (rules[name].required) {
          throw new ArgumentError(`Argument ${name} is required.`);
        }
      }
    } else {
      if (raw.length) {
        if (!raw[i]) {
          if (rules[name].default !== undefined) {
            args[_name] = rules[name].default;
            i++;
            continue;
          } else if (rules[name].required) {
            throw new ArgumentError(`Argument ${name} is required.`);
          } else {
            i++;
            continue;
          }
        }
        assigntype(_name, name, raw[i], args, rules);
        i++;
      } else {
        if (rules[name].default !== undefined) {
          args[_name] = rules[name].default;
          i++;
          continue;
        }
        if (rules[name].required) {
          throw new ArgumentError(`Argument ${name} is required.`);
        }
      }
    }
  }
}

function assigntype(_name, name, value, args, rules) {
  if (
    !Array.isArray(rules[name].type) &&
    typeof rules[name].type === "function"
  ) {
    args[_name] = rules[name].type(_name, value, args);
    checkconstraint(rules, args, name, _name);
  } else {
    if (Array.isArray(rules[name].type)) {
      for (let i = 0, n = rules[name].type.length; i < n; i++) {
        try {
          args[_name] = rules[name].type[i](_name, value, args);
          checkconstraint(rules, args, name, _name);
          break;
        } catch (e) {
          if (e.name === "ArgumentConstraintError") throw e;
          if (i === n - 1) {
            throw new ArgumentTypeError(
              `Argument ${name} must be a valid (${rules[name].type
                .map(f => f.toString())
                .join(" | ")}) format.`
            );
          }
        }
      }
    }
  }
}

function checkconstraint(rules, args, name, _name) {
  if (!rules[name].constraints) return;

  let constraints = rules[name].constraints;
  for (let i = 0, n = constraints.length; i < n; i++) {
    if (!constraints[i][0](args[_name])) {
      throw new ArgumentConstraintError(
        `Argument ${name} value must meet a condition: ${constraints[i][1]}`
      );
    }
  }
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
    default: false
  };

  if (args) {
    Object.keys(args).forEach(arg => {
      let name = [];
      name.push(arg);
      if (args[arg].alias) name.push(args[arg].alias);
      if (arg.startsWith("--")) args[arg].type = argstype.BOOLEAN;
      if (!args[arg].type) args[arg].type = argstype.STRING;
      let type = Array.isArray(args[arg].type)
        ? "(" + args[arg].type.map(f => f.toString()).join(" | ") + ")"
        : args[arg].type.toString();
      let out = {
        name: name.join(", "),
        realname: name[0],
        desc: args[arg].description || "-",
        type,
        positional: !arg.startsWith("-"),
        default: args[arg].default || "-",
        required: args[arg].required || false
      };
      if (out.positional) {
        args_positional.push("<" + out.realname + ">");
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

  args_not_positional_.sort(function(x, y) {
    return Boolean(x.required) === Boolean(y.required)
      ? 0
      : Boolean(x.required)
      ? -1
      : 1;
  });
  args_not_positional_.unshift({
    name: "--help, --h",
    desc: "Buat munculin pesan ini",
    type: "Boolean"
  });

  let pos_msg = args_positional_.map(d => {
    return `•  ${d.name}
    Required: ${d.required ? "yes" : "no"}
    Description: ${d.desc}
    Data Type: ${d.type}
    Default Value: ${
      d.default === "-" || !d.default ? "-" : JSON.stringify(d.default)
    }`;
  });

  let not_pos_msg = args_not_positional_.map(d => {
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

Name: ${data.name}
Description: ${data.description}
Disabled: ${data.DISABLED ? "yes" : "no"}
Admin only: ${data.ADMIN ? "yes" : "no"}

Positional Argument(s):
${pos_msg.length ? pos_msg.join("\n") : "-"}

Non-Positional Argument(s):
${not_pos_msg.length ? not_pos_msg.join("\n") : "-"}`;

  return {
    type: "text",
    text: message
  };
}
