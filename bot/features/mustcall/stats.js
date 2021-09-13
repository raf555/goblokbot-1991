module.exports = {
  data: {
    name: "Stats Command",
    description: "Buat ngirim detil waktu dari suatu fitur",
    usage: "[@bot/!] stats <command>",
    CMD: "stats",
    ALIASES: []
  },
  run: stats
};

async function stats(parsed, event, bot) {
  let run = bot.function.exec;
  let cmd = parsed.arg || parsed.args.cmd || "tes";

  let execstart = Date.now();
  let res = await run(cmd, event)
    .then(reply => {
      if (!reply || (Array.isArray(reply) && reply.length === 0)) {
        return {
          res: false,
          msg: "No reply"
        };
      }
      return {
        res: true,
        msg: reply,
        time: reply.time_metadata
      };
    })
    .catch(e => {
      return {
        res: false,
        msg: e.name + ": " + e.message
      };
    });
  let exectime = Date.now() - execstart;

  let out = makeres(cmd, res);
  return {
    type: "text",
    text: out,
    nosave: true
  };
}

function makeres() {
  let [cmd, res] = arguments;

  if (!res.res) {
    return `Command: ${cmd}

Result: ${res.msg}`;
  }

  let {
    receive: receivetime,
    pass: passingtime,
    parse: parsetime,
    exec: exectime
  } = res.time;

  return `Command: ${cmd}
LINE to Bot latency: ${addms(receivetime)}

Pass time: ${addms(passingtime)}
Parse time: ${addms(parsetime)}
Execute time: ${addms(exectime)}
Result: Success

Overall process time: ${addms(passingtime + parsetime + exectime)}
Delay: ${addms(receivetime + passingtime + parsetime + exectime)}`;
}

function addms(t) {
  return t + " ms";
}
