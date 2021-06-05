const { parseArgsStringToArgv } = require("string-argv");

module.exports = {
  parse,
  parseArg
};

function parse(message, caller) {
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

  let cmdb = command;
  command = parseArgsStringToArgv(command);

  let parsed = {};
  parsed.caller = _caller;
  parsed.called = !!_caller;
  parsed.args = {};
  parsed.shortcut = isShortcut;

  let arg = [];

  let idx = 0;
  while (idx < command.length) {
    let word = command[idx];

    if (idx === 0) {
      parsed.command = word.toLowerCase();
    } else {
      if (word.match(/^-{1}\w+/)) {
        let custombracket = parsed.args.b;
        if (custombracket) {
          let cust = getcustbracket(custombracket);
          let regex = new RegExp(`${word}[.\\s\\n\\r\\t]*?\\${cust[0]}((.|\n|\r|\t)*?)\\${cust[1]}`);
          if (cmdb.match(regex)) {
            let thearg = /^-{1}(\w+)/.exec(word);
            let theval = regex.exec(cmdb);
            parsed.args[thearg[1].toLowerCase()] = theval[1];
            cmdb = cmdb.replace(theval[0], " removed");
            command = parseArgsStringToArgv(cmdb);
          } else {
            parsed.args[word.replace("-", "").toLowerCase()] = command[idx + 1];
            idx++;
          }
        } else {
          parsed.args[word.replace("-", "").toLowerCase()] = command[idx + 1];
          idx++;
        }
      } else if (word.match(/^-{2}\w+/)) {
        parsed.args[word.replace("--", "").toLowerCase()] = 1;
      } else {
        arg.push(word);
      }
    }
    idx++;
  }

  parsed.arg = arg.join(" ");
  //console.log(parsed)

  return parsed;
}

function parseArg(text) {
  let args = parseArgsStringToArgv(text);
  let out = {};

  let idx = 0;
  while (idx < args.length) {
    let word = args[idx];

    if (word.match(/^-{1}\w+/)) {
      let custombracket = out.b;
      if (custombracket) {
        let cust = getcustbracket(custombracket);
        let regex = new RegExp(`${word}[.\\s\\n\\r\\t]*?\\${cust[0]}((.|\n|\r|\t)*?)\\${cust[1]}`);
        if (text.match(regex)) {
          let thearg = /^-{1}(\w+)/.exec(word);
          let theval = regex.exec(text);
          out[thearg[1].toLowerCase()] = theval[1];
          text = text.replace(theval[0], " removed");
          args = parseArgsStringToArgv(text);
        } else {
          out[word.replace("-", "").toLowerCase()] = args[idx + 1];
          idx++;
        }
      } else {
        out[word.replace("-", "").toLowerCase()] = args[idx + 1];
        idx++;
      }
    } else if (word.match(/^-{2}\w+/)) {
      out[word.replace("--", "").toLowerCase()] = 1;
    }
    idx++;
  }
  //console.log(out)

  return out;
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
