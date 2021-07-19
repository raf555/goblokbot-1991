const Jimp = require("jimp");
const axios = require("axios");
const imgbb = require("./../../../service/imgbb");
const db = require("./../../../service/database");
const { parseArg } = require("./../../parser");
const { Parser } = require("expr-eval");
const tables = table();

module.exports = (parsed, event) => {
  if (parsed.args.compare) {
    return compare(parsed.args.compare);
  }

  if (parsed.args.getsize) {
    return getsize(parsed.args.getsize);
  }

  return process(parsed.args).then(url => {
    let out = [
      {
        type: "image",
        originalContentUrl: url,
        previewImageUrl: url
      }
    ];

    if (parsed.args.out) {
      out.push({
        type: "text",
        text: "URL: " + url + "\n\nThe link will expire in 24 hours"
      });
    }
    return out;
  });
};

async function getsize(val) {
  let urls = val.split(" ");
  let out = [];

  for (let i = 0; i < urls.length; i++) {
    let img = await Jimp.read(await getBufferFromURL(urls[i]));
    out.push(`${i + 1}. ${img.bitmap.width}x${img.bitmap.height}`);
  }

  return {
    type: "text",
    text: out.join("\n")
  };
}

async function compare(val) {
  let val2 = parseArg(val);

  let url1, url2;
  if (Object.keys(val2).length > 0) {
    url1 = val2["url1"];
    url2 = val2["url2"];
  } else {
    val2 = val.split(/\s|,/);
    url1 = val2[0];
    url2 = val2[1];
  }

  let img1 = await Jimp.read(await getBufferFromURL(url1));
  let img2 = await Jimp.read(await getBufferFromURL(url2));

  let distance = Jimp.distance(img1, img2); // perceived distance
  let diff = Jimp.diff(img1, img2); // pixel difference

  let out;
  if (distance < 0.15 || diff.percent < 0.15) {
    out = "Images match: " + (1 - diff.percent) * 100 + "%";
  } else {
    out = "Images don't match: " + (1 - diff.percent) * 100 + "%";
  }

  return { type: "text", text: out };
}

async function process(args) {
  let image = await createImage(args);
  let buffer = (await image.getBufferAsync(Jimp.MIME_PNG)).toString("base64");

  let upload = await imgbb.upload({
    name: "jimptes" + Date.now(),
    base64string: buffer,
    expiration: 3600 * 24
  });
  let url = upload.url;
  return url;
}

async function makeJIMP(args, parentdata) {
  let baru = args.new || args.n;
  let fromid = args.fromid || args.id;
  let fromuser = args.fromuser || args.user;
  let url = args.url || args.u;

  delete args["url"];
  delete args["u"];
  delete args["fromid"];
  delete args["id"];
  delete args["fromuser"];
  delete args["user"];
  delete args["new"];
  delete args["n"];

  if (url) {
    return Jimp.read(await getBufferFromURL(url));
  } else if (baru) {
    if (baru === 1) {
      return Jimp.create(512, 512, "#ffffff");
    } else {
      let s = parseArg(baru);
      if (s.c && s.c === "random") {
        s.c = "#" + Math.floor(Math.random() * 16777215).toString(16);
      }
      if (!parentdata) {
        return Jimp.create(
          Number(s.w) || 512,
          Number(s.h) || 512,
          s.c || "#ffffff"
        );
      } else {
        return Jimp.create(
          Number(s.w) || calc(s.w, parentdata) || 512,
          Number(s.h) || calc(s.h, parentdata) || 512,
          s.c || "#ffffff"
        );
      }
    }
    delete args["new"];
  } else if (fromid) {
    let dbimg = db.open("db/uploadimg.json");

    if (!dbimg.get(fromid)) {
      throw Error("Invalid ID");
    }

    if (dbimg.get(fromid).exp < Date.now()) {
      throw Error("Image expired");
    }

    return Jimp.read(dbimg.get(fromid).url);
  } else if (fromuser) {
    let dbuser = db.open("db/user.json").get();

    let filter = Object.values(dbuser).filter(
      data => data.key === fromuser.toLowerCase()
    );

    if (filter.length < 1) {
      throw Error("Key not found");
    }

    return Jimp.read(filter[0].image);
  }
}

async function createImage(args, parentdata) {
  let image = await makeJIMP(args, parentdata);

  //console.log(();

  let command = Object.keys(args);
  let tablekey = Object.keys(tables);

  for (let i = 0; i < command.length; i++) {
    let edit = command[i];
    let more = /(.*?)\d+/.test(edit) ? /(.*?)\d+/.exec(edit)[1] : null;

    if (tablekey.includes(edit)) {
      image = await tables[edit](image, args[edit]);
    } else {
      if (more && tablekey.includes(more)) {
        image = await tables[more](image, args[edit]);
      }
    }
  }

  return image;
}

function table() {
  return {
    rotate,
    invert,
    greyscale,
    resize,
    print,
    composite,
    quality,
    scale,
    crop,
    mask,
    mirror,
    brightness,
    contrass,
    blur,
    opacity,
    pixelate,
    posterize
  };
}

function pixelate(image, val) {
  let val2 = parseArg(val);

  let x, y, h, w, p;
  if (Object.keys(val2).length > 0) {
    x = Number(val2.x) || 0;
    y = Number(val2.y) || 0;

    let datacalc = {
      height: image.bitmap.height,
      y: y,
      width: image.bitmap.width,
      x: x
    };
    h = Number(val2.h) || calc(val2.h, datacalc);
    w = Number(val2.w) || calc(val2.w, datacalc);
    p = Number(val2.p);
    return image.pixelate(p, x, y, w, h);
  } else {
    if (typeof val === "string" && !isNaN(val)) {
      p = Number(val);
    }
    return image.pixelate(p);
  }
}

function posterize(image, val) {
  if (typeof val === "string" && !isNaN(val)) {
    val = Number(val);
  }
  return image.posterize(val);
}

function opacity(image, val) {
  if (typeof val === "string" && !isNaN(val)) {
    val = Number(val);
  }
  return image.opacity(val);
}

function blur(image, val) {
  if (typeof val === "string" && !isNaN(val)) {
    val = Number(val);
  }
  return image.blur(val);
}

function contrass(image, val) {
  if (typeof val === "string" && !isNaN(val)) {
    val = Number(val);
  }
  return image.contrass(val);
}

function brightness(image, val) {
  if (typeof val === "string" && !isNaN(val)) {
    val = Number(val);
  }
  return image.brightness(val);
}

function mirror(image, val) {
  if (val === 1) {
    return image.mirror(true, false);
  }

  val = parseArg(val);

  return image.mirror(!!val.y, !!val.x);
}

function mask(image, val) {
  val = parseArg(val);

  let pos = val.pos;
  let centerized = val.centerized === 1;
  let center = val.center === 1;

  let datacalc = {
    width: image.bitmap.width,
    height: image.bitmap.height
  };
  return createImage(val, datacalc).then(image2 => {
    let x = 0,
      y = 0;

    datacalc.cwidth = image2.bitmap.width;
    datacalc.cheight = image2.bitmap.height;

    if (pos) {
      pos = pos.split(",");
      x = Number(pos[0]) || calc(pos[0], datacalc);
      y = Number(pos[1]) || calc(pos[1], datacalc);
    } else {
      if (val.x) {
        x = Number(val.x) || calc(val.x, datacalc);
      }
      if (val.y) {
        y = Number(val.y) || calc(val.y, datacalc);
      }
    }
    if (center) {
      x = (datacalc.width - datacalc.cwidth) / 2;
      y = (datacalc.height - datacalc.cheight) / 2;
    }
    if (centerized) {
      x -= datacalc.cwidth / 2;
      y -= datacalc.cheight / 2;
    }
    return image.mask(image2, x, y);
  });
}

function crop(image, val) {
  val = parseArg(val);

  let x = Number(val.x) || 0,
    y = Number(val.y) || 0,
    datacalc = {
      height: image.bitmap.height,
      y: y,
      width: image.bitmap.width,
      x: x
    },
    h = Number(val.h) || calc(val.h, datacalc),
    w = Number(val.w) || calc(val.w, datacalc);

  return image.crop(x, y, w, h);
}

function scale(image, val) {
  if (typeof val === "string" && !isNaN(val)) {
    val = Number(val);
  }
  return image.scale(val);
}

function quality(image, val) {
  if (typeof val === "string" && !isNaN(val)) {
    val = Number(val);
  }
  return image.quality(val);
}

function composite(image, val) {
  val = parseArg(val);

  let pos = val.pos;
  let centerized = val.centerized === 1;
  let center = val.center === 1;

  let datacalc = {
    width: image.bitmap.width,
    height: image.bitmap.height
  };

  return createImage(val, datacalc).then(image2 => {
    let x = 0,
      y = 0;

    datacalc.cwidth = image2.bitmap.width;
    datacalc.cheight = image2.bitmap.height;

    if (pos) {
      pos = pos.split(",");
      x = Number(pos[0]) || calc(pos[0], datacalc);
      y = Number(pos[1]) || calc(pos[1], datacalc);
    } else {
      if (val.x) {
        x = Number(val.x) || calc(val.x, datacalc);
      }
      if (val.y) {
        y = Number(val.y) || calc(val.y, datacalc);
      }
    }
    if (center) {
      x = (datacalc.width - datacalc.cwidth) / 2;
      y = (datacalc.height - datacalc.cheight) / 2;
    }
    if (centerized) {
      x -= datacalc.cwidth / 2;
      y -= datacalc.cheight / 2;
    }
    return image.composite(image2, x, y);
  });
}

async function print(image, val) {
  val = parseArg(val);

  let text = val.text || val.t || null;
  let size = val.size || val.s || 32;
  let color = (val.color || val.c || "black").toUpperCase();
  let align = val.align || val.al;
  if (!align || (align !== "left" && align !== "right" && align !== "center")) {
    align = "center";
  }
  align = `HORIZONTAL_ALIGN_${align.toUpperCase()}`;

  let font;
  let fontname = `FONT_SANS_${size}_${color}`;
  font = await Jimp.loadFont(Jimp[fontname]);

  let textwidth = Jimp.measureText(font, text || "");

  let datacalc = {
    height: image.bitmap.height,
    width: image.bitmap.width,
    twidth: textwidth
  };

  if (val.top) {
    image = await image.print(
      font,
      0,
      0,
      {
        text: val.top,
        alignmentX: Jimp[align],
        alignmentY: Jimp.VERTICAL_ALIGN_TOP
      },
      image.bitmap.width,
      image.bitmap.height
    );
  }

  if (val.middle) {
    image = await image.print(
      font,
      0,
      0,
      {
        text: val.middle,
        alignmentX: Jimp[align],
        alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
      },
      image.bitmap.width,
      image.bitmap.height
    );
  }

  if (text) {
    let pos = val.pos;

    let x = 0,
      y = 0;
    if (pos) {
      pos = pos.split(",");
      x = Number(pos[0]) || calc(pos[0], datacalc);
      y = Number(pos[1]) || calc(pos[1], datacalc);
    } else {
      if (val.x) {
        x = Number(val.x) || calc(val.x, datacalc);
      }
      if (val.y) {
        y = Number(val.y) || calc(val.y, datacalc);
      }
    }

    if (x || y) {
      image = await image.print(font, x, y, text);
    } else {
      image = await image.print(
        font,
        0,
        0,
        {
          text: text,
          alignmentX: Jimp[align],
          alignmentY: Jimp.VERTICAL_ALIGN_BOTTOM
        },
        image.bitmap.width,
        image.bitmap.height
      );
    }
  }

  return image;
}

function invert(image, val) {
  return image.invert();
}

function greyscale(image, val) {
  return image.greyscale();
}

function resize(image, val) {
  let xy = val.split(",");

  let x = xy[0],
    y = xy[1];

  if (x.toLowerCase() === "auto") {
    x = Jimp.AUTO;
  } else {
    if (!isNaN(x)) {
      x = Number(x);
    }
  }

  if (y.toLowerCase() === "auto") {
    y = Jimp.AUTO;
  } else {
    if (!isNaN(y)) {
      y = Number(y);
    }
  }

  return image.resize(x, y);
}

function rotate(image, val) {
  if (typeof val === "string" && !isNaN(val)) {
    val = Number(val);
  }
  val *= -1;
  return image.rotate(val);
}

function calc(...args) {
  return Parser.evaluate(...args);
}

function getBufferFromURL(url) {
  return axios
    .get(url, {
      responseType: "arraybuffer"
    })
    .then(response => Buffer.from(response.data, "binary"));
}
