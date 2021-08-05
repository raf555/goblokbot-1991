const { parseArgsStringToArgv } = require("string-argv");

module.exports = {
  parse,
  parseArg,
  buildFromParsed,
  buildArgs,
  removeArgFromMsg,
  removeParserArgs,
  restoreParserArgs
};

function parse(message, caller) {
  message = message.trim();

  let splitted = message.split(" ");
  let firstword = splitted[0].toLowerCase();

  let command = "";
  let _caller = "";
  let isShortcut = false;

  if (firstword !== caller.normal) {
    if (firstword.charAt(0) === caller.shortcut) {
      command = message.substring(1);
      _caller = caller.shortcut;
      isShortcut = true;
    } else {
      if (caller.custom.normal[firstword]) {
        command = splitted.slice(1, splitted.length).join(" ");
        _caller = firstword;
      } else if (caller.custom.shortcut[firstword.charAt(0)]) {
        command = message.substring(1);
        _caller = caller.shortcut;
        isShortcut = true;
      } else {
        command = splitted.join(" ");
        _caller = "";
      }
    }
  } else {
    command = splitted.slice(1, splitted.length).join(" ");
    _caller = caller.normal;
  }

  let parsearg = parseArg(command);
  let argsplit = parsearg.arg.split(" ");

  let parsed = {
    caller: _caller,
    called: !!_caller,
    shortcut: isShortcut,
    command: argsplit.shift().toLowerCase(),
    args: parsearg.args,
    arg: argsplit.join(" "),
    fullMsg: message
  };

  /*
  parsed.caller = _caller;
  parsed.called = !!_caller;
  parsed.shortcut = isShortcut;
  parsed.command = argsplit.shift().toLowerCase();
  parsed.args = parsearg.args;
  parsed.arg = argsplit.join(" ");
  parsed.fullMsg = message;
  */

  // delete parsed.args["b"];
  // console.log(parsed);

  return parsed;
}

function parseArg(text) {
  let argsregex1 = new RegExp(`^-{1}([a-zA-Z_]\\w*[-\\w]*)`);
  let argsregex2 = new RegExp(`^-{2}([a-zA-Z_]\\w*[-\\w]*)`);

  let args = parseArgsStringToArgv(text);
  let out = {};
  let arg = [];

  let idx = 0;
  while (idx < args.length) {
    let word = args[idx];

    // replace equal sign if any
    if (/^[(-{1})(-{2})][a-zA-Z_]\w*[-\w]*=/.test(word)) {
      let splt = [
        word.substring(0, word.indexOf("=")),
        word.substring(word.indexOf("=") + 1)
      ];
      let join = splt.join(" ");
      splt = parseArgsStringToArgv(join);
      args[idx] = splt[0];
      args.splice(idx + 1, 0, splt[1]);
      text = text.replace(word, join);
      continue;
    }

    if (word.match(argsregex1)) {
      let custombracket = out.b;
      if (custombracket) {
        let cust = getcustbracket(custombracket);
        let regex = new RegExp(
          `${escapeRegExp(word)}[.\\s\\n\\r\\t]*?\\${
            cust[0]
          }((.|\n|\r|\t)*?)\\${cust[1]}`
        );
        if (text.match(regex)) {
          let thearg = argsregex1.exec(word);
          let theval = regex.exec(text);
          out[thearg[1]] = theval[1]; // tolowercase
          text = text.replace(theval[0], " removed");
          args = parseArgsStringToArgv(text);
        } else {
          out[word.replace("-", "")] = args[idx + 1] // tolowercase
            ? args[idx + 1].replace(/\\/g, "")
            : null;
          idx++;
        }
      } else {
        out[word.replace("-", "")] = args[idx + 1] // tolowercase
          ? args[idx + 1].replace(/\\/g, "")
          : null;
        idx++;
      }
    } else if (word.match(argsregex2)) {
      out[word.replace("--", "")] = true; // tolowercase
    } else {
      arg.push(word);
    }

    idx++;
  }

  // delete out["b"];
  // console.log(out);

  return { args: out, arg: arg.join(" ") };
}

function getcustbracket(val) {
  let out = [];
  if (val.length >= 2) {
    out.push(val[0]);
    out.push(val[1]);
  } else {
    out.push(val[0]);
    out.push(val[0]);
  }

  return out;
}

function buildFromParsed(parsed, commandonly = false) {
  let out = "";
  out += parsed.caller;

  if (parsed.called && !parsed.shortcut) {
    out += " ";
  }

  out += parsed.command;

  if (!commandonly) {
    out += buildArgs(parsed);
    out += " " + parsed.arg;
  }

  return out;
}

function buildArgs(parsed) {
  const makebracket = (t, cb = null) => {
    if (t.split(" ").length > 0) {
      let b = '"';
      if (t.match(/"/g)) {
        b = "'";
      }
      if (cb) {
        if (cb === -1) {
          b = "";
        } else {
          b = cb;
        }
      }
      if (t[0] === ";") {
        t = "\\" + t;
      }
      t = `${b}${t}${b}`;
    }
    return t;
  };

  let out = "";
  let args = Object.keys(parsed.args);
  let b = parsed.args.b;

  args.forEach(arg => {
    out += " ";
    if (parsed.args[arg] === true) {
      out += "--" + arg;
    } else {
      let cb = arg === "b" ? -1 : b;
      out += "-" + arg + " " + makebracket(parsed.args[arg], cb);
    }
  });

  return out;
}

function removeArgFromMsg(msg, arg) {
  let args = Object.keys(arg);
  msg = msg.replace(/\n/g, " ");

  let list_arg = [];

  for (let i = 0; i < args.length; i++) {
    if (arg[args[i]] === true) {
      list_arg.push(" --" + args[i]);
    } else {
      let argz = arg[args[i]];
      if (argz) {
        argz = " " + argz;
      } else {
        argz = "";
      }
      list_arg.push(" -" + args[i] + argz);
    }
  }

  for (let j = 0; j < list_arg.length; j++) {
    msg = msg.replace(list_arg[j], "");
  }

  return msg;
}

function removeParserArgs(parsed) {
  let reserved = {};

  if (parsed.args.b) {
    reserved.b = parsed.args.b;
    delete parsed.args["b"];
  }

  return reserved;
}

function restoreParserArgs(parsed, data) {
  Object.assign(parsed.args, data);
  return parsed;
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}
