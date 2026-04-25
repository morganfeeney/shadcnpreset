"use strict";
(() => {
  var __freeze = Object.freeze;
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a2, b2) => {
    for (var prop in b2 || (b2 = {}))
      if (__hasOwnProp.call(b2, prop))
        __defNormalProp(a2, prop, b2[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b2)) {
        if (__propIsEnum.call(b2, prop))
          __defNormalProp(a2, prop, b2[prop]);
      }
    return a2;
  };
  var __spreadProps = (a2, b2) => __defProps(a2, __getOwnPropDescs(b2));
  var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(raw || cooked.slice()) }));

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/rgb/parseNumber.js
  var parseNumber = (color, len) => {
    if (typeof color !== "number") return;
    if (len === 3) {
      return {
        mode: "rgb",
        r: (color >> 8 & 15 | color >> 4 & 240) / 255,
        g: (color >> 4 & 15 | color & 240) / 255,
        b: (color & 15 | color << 4 & 240) / 255
      };
    }
    if (len === 4) {
      return {
        mode: "rgb",
        r: (color >> 12 & 15 | color >> 8 & 240) / 255,
        g: (color >> 8 & 15 | color >> 4 & 240) / 255,
        b: (color >> 4 & 15 | color & 240) / 255,
        alpha: (color & 15 | color << 4 & 240) / 255
      };
    }
    if (len === 6) {
      return {
        mode: "rgb",
        r: (color >> 16 & 255) / 255,
        g: (color >> 8 & 255) / 255,
        b: (color & 255) / 255
      };
    }
    if (len === 8) {
      return {
        mode: "rgb",
        r: (color >> 24 & 255) / 255,
        g: (color >> 16 & 255) / 255,
        b: (color >> 8 & 255) / 255,
        alpha: (color & 255) / 255
      };
    }
  };
  var parseNumber_default = parseNumber;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/colors/named.js
  var named = {
    aliceblue: 15792383,
    antiquewhite: 16444375,
    aqua: 65535,
    aquamarine: 8388564,
    azure: 15794175,
    beige: 16119260,
    bisque: 16770244,
    black: 0,
    blanchedalmond: 16772045,
    blue: 255,
    blueviolet: 9055202,
    brown: 10824234,
    burlywood: 14596231,
    cadetblue: 6266528,
    chartreuse: 8388352,
    chocolate: 13789470,
    coral: 16744272,
    cornflowerblue: 6591981,
    cornsilk: 16775388,
    crimson: 14423100,
    cyan: 65535,
    darkblue: 139,
    darkcyan: 35723,
    darkgoldenrod: 12092939,
    darkgray: 11119017,
    darkgreen: 25600,
    darkgrey: 11119017,
    darkkhaki: 12433259,
    darkmagenta: 9109643,
    darkolivegreen: 5597999,
    darkorange: 16747520,
    darkorchid: 10040012,
    darkred: 9109504,
    darksalmon: 15308410,
    darkseagreen: 9419919,
    darkslateblue: 4734347,
    darkslategray: 3100495,
    darkslategrey: 3100495,
    darkturquoise: 52945,
    darkviolet: 9699539,
    deeppink: 16716947,
    deepskyblue: 49151,
    dimgray: 6908265,
    dimgrey: 6908265,
    dodgerblue: 2003199,
    firebrick: 11674146,
    floralwhite: 16775920,
    forestgreen: 2263842,
    fuchsia: 16711935,
    gainsboro: 14474460,
    ghostwhite: 16316671,
    gold: 16766720,
    goldenrod: 14329120,
    gray: 8421504,
    green: 32768,
    greenyellow: 11403055,
    grey: 8421504,
    honeydew: 15794160,
    hotpink: 16738740,
    indianred: 13458524,
    indigo: 4915330,
    ivory: 16777200,
    khaki: 15787660,
    lavender: 15132410,
    lavenderblush: 16773365,
    lawngreen: 8190976,
    lemonchiffon: 16775885,
    lightblue: 11393254,
    lightcoral: 15761536,
    lightcyan: 14745599,
    lightgoldenrodyellow: 16448210,
    lightgray: 13882323,
    lightgreen: 9498256,
    lightgrey: 13882323,
    lightpink: 16758465,
    lightsalmon: 16752762,
    lightseagreen: 2142890,
    lightskyblue: 8900346,
    lightslategray: 7833753,
    lightslategrey: 7833753,
    lightsteelblue: 11584734,
    lightyellow: 16777184,
    lime: 65280,
    limegreen: 3329330,
    linen: 16445670,
    magenta: 16711935,
    maroon: 8388608,
    mediumaquamarine: 6737322,
    mediumblue: 205,
    mediumorchid: 12211667,
    mediumpurple: 9662683,
    mediumseagreen: 3978097,
    mediumslateblue: 8087790,
    mediumspringgreen: 64154,
    mediumturquoise: 4772300,
    mediumvioletred: 13047173,
    midnightblue: 1644912,
    mintcream: 16121850,
    mistyrose: 16770273,
    moccasin: 16770229,
    navajowhite: 16768685,
    navy: 128,
    oldlace: 16643558,
    olive: 8421376,
    olivedrab: 7048739,
    orange: 16753920,
    orangered: 16729344,
    orchid: 14315734,
    palegoldenrod: 15657130,
    palegreen: 10025880,
    paleturquoise: 11529966,
    palevioletred: 14381203,
    papayawhip: 16773077,
    peachpuff: 16767673,
    peru: 13468991,
    pink: 16761035,
    plum: 14524637,
    powderblue: 11591910,
    purple: 8388736,
    // Added in CSS Colors Level 4:
    // https://drafts.csswg.org/css-color/#changes-from-3
    rebeccapurple: 6697881,
    red: 16711680,
    rosybrown: 12357519,
    royalblue: 4286945,
    saddlebrown: 9127187,
    salmon: 16416882,
    sandybrown: 16032864,
    seagreen: 3050327,
    seashell: 16774638,
    sienna: 10506797,
    silver: 12632256,
    skyblue: 8900331,
    slateblue: 6970061,
    slategray: 7372944,
    slategrey: 7372944,
    snow: 16775930,
    springgreen: 65407,
    steelblue: 4620980,
    tan: 13808780,
    teal: 32896,
    thistle: 14204888,
    tomato: 16737095,
    turquoise: 4251856,
    violet: 15631086,
    wheat: 16113331,
    white: 16777215,
    whitesmoke: 16119285,
    yellow: 16776960,
    yellowgreen: 10145074
  };
  var named_default = named;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/rgb/parseNamed.js
  var parseNamed = (color) => {
    return parseNumber_default(named_default[color.toLowerCase()], 6);
  };
  var parseNamed_default = parseNamed;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/rgb/parseHex.js
  var hex = /^#?([0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{4}|[0-9a-f]{3})$/i;
  var parseHex = (color) => {
    let match;
    return (match = color.match(hex)) ? parseNumber_default(parseInt(match[1], 16), match[1].length) : void 0;
  };
  var parseHex_default = parseHex;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/util/regex.js
  var num = "([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)";
  var num_none = `(?:${num}|none)`;
  var per = `${num}%`;
  var per_none = `(?:${num}%|none)`;
  var num_per = `(?:${num}%|${num})`;
  var num_per_none = `(?:${num}%|${num}|none)`;
  var hue = `(?:${num}(deg|grad|rad|turn)|${num})`;
  var hue_none = `(?:${num}(deg|grad|rad|turn)|${num}|none)`;
  var c = `\\s*,\\s*`;
  var rx_num_per_none = new RegExp("^" + num_per_none + "$");

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/rgb/parseRgbLegacy.js
  var rgb_num_old = new RegExp(
    `^rgba?\\(\\s*${num}${c}${num}${c}${num}\\s*(?:,\\s*${num_per}\\s*)?\\)$`
  );
  var rgb_per_old = new RegExp(
    `^rgba?\\(\\s*${per}${c}${per}${c}${per}\\s*(?:,\\s*${num_per}\\s*)?\\)$`
  );
  var parseRgbLegacy = (color) => {
    let res = { mode: "rgb" };
    let match;
    if (match = color.match(rgb_num_old)) {
      if (match[1] !== void 0) {
        res.r = match[1] / 255;
      }
      if (match[2] !== void 0) {
        res.g = match[2] / 255;
      }
      if (match[3] !== void 0) {
        res.b = match[3] / 255;
      }
    } else if (match = color.match(rgb_per_old)) {
      if (match[1] !== void 0) {
        res.r = match[1] / 100;
      }
      if (match[2] !== void 0) {
        res.g = match[2] / 100;
      }
      if (match[3] !== void 0) {
        res.b = match[3] / 100;
      }
    } else {
      return void 0;
    }
    if (match[4] !== void 0) {
      res.alpha = Math.max(0, Math.min(1, match[4] / 100));
    } else if (match[5] !== void 0) {
      res.alpha = Math.max(0, Math.min(1, +match[5]));
    }
    return res;
  };
  var parseRgbLegacy_default = parseRgbLegacy;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/_prepare.js
  var prepare = (color, mode) => color === void 0 ? void 0 : typeof color !== "object" ? parse_default(color) : color.mode !== void 0 ? color : mode ? __spreadProps(__spreadValues({}, color), { mode }) : void 0;
  var prepare_default = prepare;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/converter.js
  var converter = (target_mode = "rgb") => (color) => (color = prepare_default(color, target_mode)) !== void 0 ? (
    // if the color's mode corresponds to our target mode
    color.mode === target_mode ? (
      // then just return the color
      color
    ) : (
      // otherwise check to see if we have a dedicated
      // converter for the target mode
      converters[color.mode][target_mode] ? (
        // and return its result...
        converters[color.mode][target_mode](color)
      ) : (
        // ...otherwise pass through RGB as an intermediary step.
        // if the target mode is RGB...
        target_mode === "rgb" ? (
          // just return the RGB
          converters[color.mode].rgb(color)
        ) : (
          // otherwise convert color.mode -> RGB -> target_mode
          converters.rgb[target_mode](converters[color.mode].rgb(color))
        )
      )
    )
  ) : void 0;
  var converter_default = converter;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/modes.js
  var converters = {};
  var modes = {};
  var parsers = [];
  var colorProfiles = {};
  var identity = (v2) => v2;
  var useMode = (definition29) => {
    converters[definition29.mode] = __spreadValues(__spreadValues({}, converters[definition29.mode]), definition29.toMode);
    Object.keys(definition29.fromMode || {}).forEach((k5) => {
      if (!converters[k5]) {
        converters[k5] = {};
      }
      converters[k5][definition29.mode] = definition29.fromMode[k5];
    });
    if (!definition29.ranges) {
      definition29.ranges = {};
    }
    if (!definition29.difference) {
      definition29.difference = {};
    }
    definition29.channels.forEach((channel) => {
      if (definition29.ranges[channel] === void 0) {
        definition29.ranges[channel] = [0, 1];
      }
      if (!definition29.interpolate[channel]) {
        throw new Error(`Missing interpolator for: ${channel}`);
      }
      if (typeof definition29.interpolate[channel] === "function") {
        definition29.interpolate[channel] = {
          use: definition29.interpolate[channel]
        };
      }
      if (!definition29.interpolate[channel].fixup) {
        definition29.interpolate[channel].fixup = identity;
      }
    });
    modes[definition29.mode] = definition29;
    (definition29.parse || []).forEach((parser) => {
      useParser(parser, definition29.mode);
    });
    return converter_default(definition29.mode);
  };
  var getMode = (mode) => modes[mode];
  var useParser = (parser, mode) => {
    if (typeof parser === "string") {
      if (!mode) {
        throw new Error(`'mode' required when 'parser' is a string`);
      }
      colorProfiles[parser] = mode;
    } else if (typeof parser === "function") {
      if (parsers.indexOf(parser) < 0) {
        parsers.push(parser);
      }
    }
  };

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/parse.js
  var IdentStartCodePoint = /[^\x00-\x7F]|[a-zA-Z_]/;
  var IdentCodePoint = /[^\x00-\x7F]|[-\w]/;
  var Tok = {
    Function: "function",
    Ident: "ident",
    Number: "number",
    Percentage: "percentage",
    ParenClose: ")",
    None: "none",
    Hue: "hue",
    Alpha: "alpha"
  };
  var _i = 0;
  function is_num(chars) {
    let ch = chars[_i];
    let ch1 = chars[_i + 1];
    if (ch === "-" || ch === "+") {
      return /\d/.test(ch1) || ch1 === "." && /\d/.test(chars[_i + 2]);
    }
    if (ch === ".") {
      return /\d/.test(ch1);
    }
    return /\d/.test(ch);
  }
  function is_ident(chars) {
    if (_i >= chars.length) {
      return false;
    }
    let ch = chars[_i];
    if (IdentStartCodePoint.test(ch)) {
      return true;
    }
    if (ch === "-") {
      if (chars.length - _i < 2) {
        return false;
      }
      let ch1 = chars[_i + 1];
      if (ch1 === "-" || IdentStartCodePoint.test(ch1)) {
        return true;
      }
      return false;
    }
    return false;
  }
  var huenits = {
    deg: 1,
    rad: 180 / Math.PI,
    grad: 9 / 10,
    turn: 360
  };
  function num2(chars) {
    let value = "";
    if (chars[_i] === "-" || chars[_i] === "+") {
      value += chars[_i++];
    }
    value += digits(chars);
    if (chars[_i] === "." && /\d/.test(chars[_i + 1])) {
      value += chars[_i++] + digits(chars);
    }
    if (chars[_i] === "e" || chars[_i] === "E") {
      if ((chars[_i + 1] === "-" || chars[_i + 1] === "+") && /\d/.test(chars[_i + 2])) {
        value += chars[_i++] + chars[_i++] + digits(chars);
      } else if (/\d/.test(chars[_i + 1])) {
        value += chars[_i++] + digits(chars);
      }
    }
    if (is_ident(chars)) {
      let id = ident(chars);
      if (id === "deg" || id === "rad" || id === "turn" || id === "grad") {
        return { type: Tok.Hue, value: value * huenits[id] };
      }
      return void 0;
    }
    if (chars[_i] === "%") {
      _i++;
      return { type: Tok.Percentage, value: +value };
    }
    return { type: Tok.Number, value: +value };
  }
  function digits(chars) {
    let v2 = "";
    while (/\d/.test(chars[_i])) {
      v2 += chars[_i++];
    }
    return v2;
  }
  function ident(chars) {
    let v2 = "";
    while (_i < chars.length && IdentCodePoint.test(chars[_i])) {
      v2 += chars[_i++];
    }
    return v2;
  }
  function identlike(chars) {
    let v2 = ident(chars);
    if (chars[_i] === "(") {
      _i++;
      return { type: Tok.Function, value: v2 };
    }
    if (v2 === "none") {
      return { type: Tok.None, value: void 0 };
    }
    return { type: Tok.Ident, value: v2 };
  }
  function tokenize(str = "") {
    let chars = str.trim();
    let tokens = [];
    let ch;
    _i = 0;
    while (_i < chars.length) {
      ch = chars[_i++];
      if (ch === "\n" || ch === "	" || ch === " ") {
        while (_i < chars.length && (chars[_i] === "\n" || chars[_i] === "	" || chars[_i] === " ")) {
          _i++;
        }
        continue;
      }
      if (ch === ",") {
        return void 0;
      }
      if (ch === ")") {
        tokens.push({ type: Tok.ParenClose });
        continue;
      }
      if (ch === "+") {
        _i--;
        if (is_num(chars)) {
          tokens.push(num2(chars));
          continue;
        }
        return void 0;
      }
      if (ch === "-") {
        _i--;
        if (is_num(chars)) {
          tokens.push(num2(chars));
          continue;
        }
        if (is_ident(chars)) {
          tokens.push({ type: Tok.Ident, value: ident(chars) });
          continue;
        }
        return void 0;
      }
      if (ch === ".") {
        _i--;
        if (is_num(chars)) {
          tokens.push(num2(chars));
          continue;
        }
        return void 0;
      }
      if (ch === "/") {
        while (_i < chars.length && (chars[_i] === "\n" || chars[_i] === "	" || chars[_i] === " ")) {
          _i++;
        }
        let alpha;
        if (is_num(chars)) {
          alpha = num2(chars);
          if (alpha.type !== Tok.Hue) {
            tokens.push({ type: Tok.Alpha, value: alpha });
            continue;
          }
        }
        if (is_ident(chars)) {
          if (ident(chars) === "none") {
            tokens.push({
              type: Tok.Alpha,
              value: { type: Tok.None, value: void 0 }
            });
            continue;
          }
        }
        return void 0;
      }
      if (/\d/.test(ch)) {
        _i--;
        tokens.push(num2(chars));
        continue;
      }
      if (IdentStartCodePoint.test(ch)) {
        _i--;
        tokens.push(identlike(chars));
        continue;
      }
      return void 0;
    }
    return tokens;
  }
  function parseColorSyntax(tokens) {
    tokens._i = 0;
    let token = tokens[tokens._i++];
    if (!token || token.type !== Tok.Function || token.value !== "color") {
      return void 0;
    }
    token = tokens[tokens._i++];
    if (token.type !== Tok.Ident) {
      return void 0;
    }
    const mode = colorProfiles[token.value];
    if (!mode) {
      return void 0;
    }
    const res = { mode };
    const coords = consumeCoords(tokens, false);
    if (!coords) {
      return void 0;
    }
    const channels = getMode(mode).channels;
    for (let ii = 0, c3, ch; ii < channels.length; ii++) {
      c3 = coords[ii];
      ch = channels[ii];
      if (c3.type !== Tok.None) {
        res[ch] = c3.type === Tok.Number ? c3.value : c3.value / 100;
        if (ch === "alpha") {
          res[ch] = Math.max(0, Math.min(1, res[ch]));
        }
      }
    }
    return res;
  }
  function consumeCoords(tokens, includeHue) {
    const coords = [];
    let token;
    while (tokens._i < tokens.length) {
      token = tokens[tokens._i++];
      if (token.type === Tok.None || token.type === Tok.Number || token.type === Tok.Alpha || token.type === Tok.Percentage || includeHue && token.type === Tok.Hue) {
        coords.push(token);
        continue;
      }
      if (token.type === Tok.ParenClose) {
        if (tokens._i < tokens.length) {
          return void 0;
        }
        continue;
      }
      return void 0;
    }
    if (coords.length < 3 || coords.length > 4) {
      return void 0;
    }
    if (coords.length === 4) {
      if (coords[3].type !== Tok.Alpha) {
        return void 0;
      }
      coords[3] = coords[3].value;
    }
    if (coords.length === 3) {
      coords.push({ type: Tok.None, value: void 0 });
    }
    return coords.every((c3) => c3.type !== Tok.Alpha) ? coords : void 0;
  }
  function parseModernSyntax(tokens, includeHue) {
    tokens._i = 0;
    let token = tokens[tokens._i++];
    if (!token || token.type !== Tok.Function) {
      return void 0;
    }
    let coords = consumeCoords(tokens, includeHue);
    if (!coords) {
      return void 0;
    }
    coords.unshift(token.value);
    return coords;
  }
  var parse = (color) => {
    if (typeof color !== "string") {
      return void 0;
    }
    const tokens = tokenize(color);
    const parsed = tokens ? parseModernSyntax(tokens, true) : void 0;
    let result = void 0;
    let i = 0;
    let len = parsers.length;
    while (i < len) {
      if ((result = parsers[i++](color, parsed)) !== void 0) {
        return result;
      }
    }
    return tokens ? parseColorSyntax(tokens) : void 0;
  };
  var parse_default = parse;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/rgb/parseRgb.js
  function parseRgb(color, parsed) {
    if (!parsed || parsed[0] !== "rgb" && parsed[0] !== "rgba") {
      return void 0;
    }
    const res = { mode: "rgb" };
    const [, r, g2, b2, alpha] = parsed;
    if (r.type === Tok.Hue || g2.type === Tok.Hue || b2.type === Tok.Hue) {
      return void 0;
    }
    if (r.type !== Tok.None) {
      res.r = r.type === Tok.Number ? r.value / 255 : r.value / 100;
    }
    if (g2.type !== Tok.None) {
      res.g = g2.type === Tok.Number ? g2.value / 255 : g2.value / 100;
    }
    if (b2.type !== Tok.None) {
      res.b = b2.type === Tok.Number ? b2.value / 255 : b2.value / 100;
    }
    if (alpha.type !== Tok.None) {
      res.alpha = Math.min(
        1,
        Math.max(
          0,
          alpha.type === Tok.Number ? alpha.value : alpha.value / 100
        )
      );
    }
    return res;
  }
  var parseRgb_default = parseRgb;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/rgb/parseTransparent.js
  var parseTransparent = (c3) => c3 === "transparent" ? { mode: "rgb", r: 0, g: 0, b: 0, alpha: 0 } : void 0;
  var parseTransparent_default = parseTransparent;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/interpolate/lerp.js
  var lerp = (a2, b2, t) => a2 + t * (b2 - a2);

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/interpolate/piecewise.js
  var get_classes = (arr) => {
    let classes = [];
    for (let i = 0; i < arr.length - 1; i++) {
      let a2 = arr[i];
      let b2 = arr[i + 1];
      if (a2 === void 0 && b2 === void 0) {
        classes.push(void 0);
      } else if (a2 !== void 0 && b2 !== void 0) {
        classes.push([a2, b2]);
      } else {
        classes.push(a2 !== void 0 ? [a2, a2] : [b2, b2]);
      }
    }
    return classes;
  };
  var interpolatorPiecewise = (interpolator) => (arr) => {
    let classes = get_classes(arr);
    return (t) => {
      let cls = t * classes.length;
      let idx = t >= 1 ? classes.length - 1 : Math.max(Math.floor(cls), 0);
      let pair = classes[idx];
      return pair === void 0 ? void 0 : interpolator(pair[0], pair[1], cls - idx);
    };
  };

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/interpolate/linear.js
  var interpolatorLinear = interpolatorPiecewise(lerp);

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/fixup/alpha.js
  var fixupAlpha = (arr) => {
    let some_defined = false;
    let res = arr.map((v2) => {
      if (v2 !== void 0) {
        some_defined = true;
        return v2;
      }
      return 1;
    });
    return some_defined ? res : arr;
  };

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/rgb/definition.js
  var definition = {
    mode: "rgb",
    channels: ["r", "g", "b", "alpha"],
    parse: [
      parseRgb_default,
      parseHex_default,
      parseRgbLegacy_default,
      parseNamed_default,
      parseTransparent_default,
      "srgb"
    ],
    serialize: "srgb",
    interpolate: {
      r: interpolatorLinear,
      g: interpolatorLinear,
      b: interpolatorLinear,
      alpha: { use: interpolatorLinear, fixup: fixupAlpha }
    },
    gamut: true,
    white: { r: 1, g: 1, b: 1 },
    black: { r: 0, g: 0, b: 0 }
  };
  var definition_default = definition;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/a98/convertA98ToXyz65.js
  var linearize = (v2 = 0) => Math.pow(Math.abs(v2), 563 / 256) * Math.sign(v2);
  var convertA98ToXyz65 = (a982) => {
    let r = linearize(a982.r);
    let g2 = linearize(a982.g);
    let b2 = linearize(a982.b);
    let res = {
      mode: "xyz65",
      x: 0.5766690429101305 * r + 0.1855582379065463 * g2 + 0.1882286462349947 * b2,
      y: 0.297344975250536 * r + 0.6273635662554661 * g2 + 0.0752914584939979 * b2,
      z: 0.0270313613864123 * r + 0.0706888525358272 * g2 + 0.9913375368376386 * b2
    };
    if (a982.alpha !== void 0) {
      res.alpha = a982.alpha;
    }
    return res;
  };
  var convertA98ToXyz65_default = convertA98ToXyz65;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/a98/convertXyz65ToA98.js
  var gamma = (v2) => Math.pow(Math.abs(v2), 256 / 563) * Math.sign(v2);
  var convertXyz65ToA98 = ({ x: x2, y: y2, z, alpha }) => {
    if (x2 === void 0) x2 = 0;
    if (y2 === void 0) y2 = 0;
    if (z === void 0) z = 0;
    let res = {
      mode: "a98",
      r: gamma(
        x2 * 2.0415879038107465 - y2 * 0.5650069742788597 - 0.3447313507783297 * z
      ),
      g: gamma(
        x2 * -0.9692436362808798 + y2 * 1.8759675015077206 + 0.0415550574071756 * z
      ),
      b: gamma(
        x2 * 0.0134442806320312 - y2 * 0.1183623922310184 + 1.0151749943912058 * z
      )
    };
    if (alpha !== void 0) {
      res.alpha = alpha;
    }
    return res;
  };
  var convertXyz65ToA98_default = convertXyz65ToA98;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/lrgb/convertRgbToLrgb.js
  var fn = (c3 = 0) => {
    const abs2 = Math.abs(c3);
    if (abs2 <= 0.04045) {
      return c3 / 12.92;
    }
    return (Math.sign(c3) || 1) * Math.pow((abs2 + 0.055) / 1.055, 2.4);
  };
  var convertRgbToLrgb = ({ r, g: g2, b: b2, alpha }) => {
    let res = {
      mode: "lrgb",
      r: fn(r),
      g: fn(g2),
      b: fn(b2)
    };
    if (alpha !== void 0) res.alpha = alpha;
    return res;
  };
  var convertRgbToLrgb_default = convertRgbToLrgb;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/xyz65/convertRgbToXyz65.js
  var convertRgbToXyz65 = (rgb2) => {
    let { r, g: g2, b: b2, alpha } = convertRgbToLrgb_default(rgb2);
    let res = {
      mode: "xyz65",
      x: 0.4123907992659593 * r + 0.357584339383878 * g2 + 0.1804807884018343 * b2,
      y: 0.2126390058715102 * r + 0.715168678767756 * g2 + 0.0721923153607337 * b2,
      z: 0.0193308187155918 * r + 0.119194779794626 * g2 + 0.9505321522496607 * b2
    };
    if (alpha !== void 0) {
      res.alpha = alpha;
    }
    return res;
  };
  var convertRgbToXyz65_default = convertRgbToXyz65;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/lrgb/convertLrgbToRgb.js
  var fn2 = (c3 = 0) => {
    const abs2 = Math.abs(c3);
    if (abs2 > 31308e-7) {
      return (Math.sign(c3) || 1) * (1.055 * Math.pow(abs2, 1 / 2.4) - 0.055);
    }
    return c3 * 12.92;
  };
  var convertLrgbToRgb = ({ r, g: g2, b: b2, alpha }, mode = "rgb") => {
    let res = {
      mode,
      r: fn2(r),
      g: fn2(g2),
      b: fn2(b2)
    };
    if (alpha !== void 0) res.alpha = alpha;
    return res;
  };
  var convertLrgbToRgb_default = convertLrgbToRgb;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/xyz65/convertXyz65ToRgb.js
  var convertXyz65ToRgb = ({ x: x2, y: y2, z, alpha }) => {
    if (x2 === void 0) x2 = 0;
    if (y2 === void 0) y2 = 0;
    if (z === void 0) z = 0;
    let res = convertLrgbToRgb_default({
      r: x2 * 3.2409699419045226 - y2 * 1.537383177570094 - 0.4986107602930034 * z,
      g: x2 * -0.9692436362808796 + y2 * 1.8759675015077204 + 0.0415550574071756 * z,
      b: x2 * 0.0556300796969936 - y2 * 0.2039769588889765 + 1.0569715142428784 * z
    });
    if (alpha !== void 0) {
      res.alpha = alpha;
    }
    return res;
  };
  var convertXyz65ToRgb_default = convertXyz65ToRgb;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/a98/definition.js
  var definition2 = __spreadProps(__spreadValues({}, definition_default), {
    mode: "a98",
    parse: ["a98-rgb"],
    serialize: "a98-rgb",
    fromMode: {
      rgb: (color) => convertXyz65ToA98_default(convertRgbToXyz65_default(color)),
      xyz65: convertXyz65ToA98_default
    },
    toMode: {
      rgb: (color) => convertXyz65ToRgb_default(convertA98ToXyz65_default(color)),
      xyz65: convertA98ToXyz65_default
    }
  });
  var definition_default2 = definition2;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/util/normalizeHue.js
  var normalizeHue = (hue3) => (hue3 = hue3 % 360) < 0 ? hue3 + 360 : hue3;
  var normalizeHue_default = normalizeHue;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/fixup/hue.js
  var hue2 = (hues, fn5) => {
    return hues.map((hue3, idx, arr) => {
      if (hue3 === void 0) {
        return hue3;
      }
      let normalized = normalizeHue_default(hue3);
      if (idx === 0 || hues[idx - 1] === void 0) {
        return normalized;
      }
      return fn5(normalized - normalizeHue_default(arr[idx - 1]));
    }).reduce((acc, curr) => {
      if (!acc.length || curr === void 0 || acc[acc.length - 1] === void 0) {
        acc.push(curr);
        return acc;
      }
      acc.push(curr + acc[acc.length - 1]);
      return acc;
    }, []);
  };
  var fixupHueShorter = (arr) => hue2(arr, (d2) => Math.abs(d2) <= 180 ? d2 : d2 - 360 * Math.sign(d2));

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/cubehelix/constants.js
  var M = [-0.14861, 1.78277, -0.29227, -0.90649, 1.97294, 0];
  var degToRad = Math.PI / 180;
  var radToDeg = 180 / Math.PI;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/cubehelix/convertRgbToCubehelix.js
  var DE = M[3] * M[4];
  var BE = M[1] * M[4];
  var BCAD = M[1] * M[2] - M[0] * M[3];
  var convertRgbToCubehelix = ({ r, g: g2, b: b2, alpha }) => {
    if (r === void 0) r = 0;
    if (g2 === void 0) g2 = 0;
    if (b2 === void 0) b2 = 0;
    let l2 = (BCAD * b2 + r * DE - g2 * BE) / (BCAD + DE - BE);
    let x2 = b2 - l2;
    let y2 = (M[4] * (g2 - l2) - M[2] * x2) / M[3];
    let res = {
      mode: "cubehelix",
      l: l2,
      s: l2 === 0 || l2 === 1 ? void 0 : Math.sqrt(x2 * x2 + y2 * y2) / (M[4] * l2 * (1 - l2))
    };
    if (res.s) res.h = Math.atan2(y2, x2) * radToDeg - 120;
    if (alpha !== void 0) res.alpha = alpha;
    return res;
  };
  var convertRgbToCubehelix_default = convertRgbToCubehelix;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/cubehelix/convertCubehelixToRgb.js
  var convertCubehelixToRgb = ({ h: h2, s, l: l2, alpha }) => {
    let res = { mode: "rgb" };
    h2 = (h2 === void 0 ? 0 : h2 + 120) * degToRad;
    if (l2 === void 0) l2 = 0;
    let amp = s === void 0 ? 0 : s * l2 * (1 - l2);
    let cosh = Math.cos(h2);
    let sinh = Math.sin(h2);
    res.r = l2 + amp * (M[0] * cosh + M[1] * sinh);
    res.g = l2 + amp * (M[2] * cosh + M[3] * sinh);
    res.b = l2 + amp * (M[4] * cosh + M[5] * sinh);
    if (alpha !== void 0) res.alpha = alpha;
    return res;
  };
  var convertCubehelixToRgb_default = convertCubehelixToRgb;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/difference.js
  var differenceHueSaturation = (std, smp) => {
    if (std.h === void 0 || smp.h === void 0 || !std.s || !smp.s) {
      return 0;
    }
    let std_h = normalizeHue_default(std.h);
    let smp_h = normalizeHue_default(smp.h);
    let dH = Math.sin((smp_h - std_h + 360) / 2 * Math.PI / 180);
    return 2 * Math.sqrt(std.s * smp.s) * dH;
  };
  var differenceHueNaive = (std, smp) => {
    if (std.h === void 0 || smp.h === void 0) {
      return 0;
    }
    let std_h = normalizeHue_default(std.h);
    let smp_h = normalizeHue_default(smp.h);
    if (Math.abs(smp_h - std_h) > 180) {
      return std_h - (smp_h - 360 * Math.sign(smp_h - std_h));
    }
    return smp_h - std_h;
  };
  var differenceHueChroma = (std, smp) => {
    if (std.h === void 0 || smp.h === void 0 || !std.c || !smp.c) {
      return 0;
    }
    let std_h = normalizeHue_default(std.h);
    let smp_h = normalizeHue_default(smp.h);
    let dH = Math.sin((smp_h - std_h + 360) / 2 * Math.PI / 180);
    return 2 * Math.sqrt(std.c * smp.c) * dH;
  };

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/average.js
  var averageAngle = (val) => {
    let sum = val.reduce(
      (sum2, val2) => {
        if (val2 !== void 0) {
          let rad = val2 * Math.PI / 180;
          sum2.sin += Math.sin(rad);
          sum2.cos += Math.cos(rad);
        }
        return sum2;
      },
      { sin: 0, cos: 0 }
    );
    let angle = Math.atan2(sum.sin, sum.cos) * 180 / Math.PI;
    return angle < 0 ? 360 + angle : angle;
  };

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/cubehelix/definition.js
  var definition3 = {
    mode: "cubehelix",
    channels: ["h", "s", "l", "alpha"],
    parse: ["--cubehelix"],
    serialize: "--cubehelix",
    ranges: {
      h: [0, 360],
      s: [0, 4.614],
      l: [0, 1]
    },
    fromMode: {
      rgb: convertRgbToCubehelix_default
    },
    toMode: {
      rgb: convertCubehelixToRgb_default
    },
    interpolate: {
      h: {
        use: interpolatorLinear,
        fixup: fixupHueShorter
      },
      s: interpolatorLinear,
      l: interpolatorLinear,
      alpha: {
        use: interpolatorLinear,
        fixup: fixupAlpha
      }
    },
    difference: {
      h: differenceHueSaturation
    },
    average: {
      h: averageAngle
    }
  };
  var definition_default3 = definition3;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/lch/convertLabToLch.js
  var convertLabToLch = ({ l: l2, a: a2, b: b2, alpha }, mode = "lch") => {
    if (a2 === void 0) a2 = 0;
    if (b2 === void 0) b2 = 0;
    let c3 = Math.sqrt(a2 * a2 + b2 * b2);
    let res = { mode, l: l2, c: c3 };
    if (c3) res.h = normalizeHue_default(Math.atan2(b2, a2) * 180 / Math.PI);
    if (alpha !== void 0) res.alpha = alpha;
    return res;
  };
  var convertLabToLch_default = convertLabToLch;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/lch/convertLchToLab.js
  var convertLchToLab = ({ l: l2, c: c3, h: h2, alpha }, mode = "lab") => {
    if (h2 === void 0) h2 = 0;
    let res = {
      mode,
      l: l2,
      a: c3 ? c3 * Math.cos(h2 / 180 * Math.PI) : 0,
      b: c3 ? c3 * Math.sin(h2 / 180 * Math.PI) : 0
    };
    if (alpha !== void 0) res.alpha = alpha;
    return res;
  };
  var convertLchToLab_default = convertLchToLab;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/xyz65/constants.js
  var k = Math.pow(29, 3) / Math.pow(3, 3);
  var e = Math.pow(6, 3) / Math.pow(29, 3);

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/constants.js
  var D50 = {
    X: 0.3457 / 0.3585,
    Y: 1,
    Z: (1 - 0.3457 - 0.3585) / 0.3585
  };
  var D65 = {
    X: 0.3127 / 0.329,
    Y: 1,
    Z: (1 - 0.3127 - 0.329) / 0.329
  };
  var k2 = Math.pow(29, 3) / Math.pow(3, 3);
  var e2 = Math.pow(6, 3) / Math.pow(29, 3);

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/lab65/convertLab65ToXyz65.js
  var fn3 = (v2) => Math.pow(v2, 3) > e ? Math.pow(v2, 3) : (116 * v2 - 16) / k;
  var convertLab65ToXyz65 = ({ l: l2, a: a2, b: b2, alpha }) => {
    if (l2 === void 0) l2 = 0;
    if (a2 === void 0) a2 = 0;
    if (b2 === void 0) b2 = 0;
    let fy = (l2 + 16) / 116;
    let fx = a2 / 500 + fy;
    let fz = fy - b2 / 200;
    let res = {
      mode: "xyz65",
      x: fn3(fx) * D65.X,
      y: fn3(fy) * D65.Y,
      z: fn3(fz) * D65.Z
    };
    if (alpha !== void 0) {
      res.alpha = alpha;
    }
    return res;
  };
  var convertLab65ToXyz65_default = convertLab65ToXyz65;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/lab65/convertLab65ToRgb.js
  var convertLab65ToRgb = (lab2) => convertXyz65ToRgb_default(convertLab65ToXyz65_default(lab2));
  var convertLab65ToRgb_default = convertLab65ToRgb;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/lab65/convertXyz65ToLab65.js
  var f = (value) => value > e ? Math.cbrt(value) : (k * value + 16) / 116;
  var convertXyz65ToLab65 = ({ x: x2, y: y2, z, alpha }) => {
    if (x2 === void 0) x2 = 0;
    if (y2 === void 0) y2 = 0;
    if (z === void 0) z = 0;
    let f0 = f(x2 / D65.X);
    let f1 = f(y2 / D65.Y);
    let f22 = f(z / D65.Z);
    let res = {
      mode: "lab65",
      l: 116 * f1 - 16,
      a: 500 * (f0 - f1),
      b: 200 * (f1 - f22)
    };
    if (alpha !== void 0) {
      res.alpha = alpha;
    }
    return res;
  };
  var convertXyz65ToLab65_default = convertXyz65ToLab65;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/lab65/convertRgbToLab65.js
  var convertRgbToLab65 = (rgb2) => {
    let res = convertXyz65ToLab65_default(convertRgbToXyz65_default(rgb2));
    if (rgb2.r === rgb2.b && rgb2.b === rgb2.g) {
      res.a = res.b = 0;
    }
    return res;
  };
  var convertRgbToLab65_default = convertRgbToLab65;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/dlch/constants.js
  var kE = 1;
  var kCH = 1;
  var \u03B8 = 26 / 180 * Math.PI;
  var cos\u03B8 = Math.cos(\u03B8);
  var sin\u03B8 = Math.sin(\u03B8);
  var factor = 100 / Math.log(139 / 100);

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/dlch/convertDlchToLab65.js
  var convertDlchToLab65 = ({ l: l2, c: c3, h: h2, alpha }) => {
    if (l2 === void 0) l2 = 0;
    if (c3 === void 0) c3 = 0;
    if (h2 === void 0) h2 = 0;
    let res = {
      mode: "lab65",
      l: (Math.exp(l2 * kE / factor) - 1) / 39e-4
    };
    let G = (Math.exp(0.0435 * c3 * kCH * kE) - 1) / 0.075;
    let e4 = G * Math.cos(h2 / 180 * Math.PI - \u03B8);
    let f4 = G * Math.sin(h2 / 180 * Math.PI - \u03B8);
    res.a = e4 * cos\u03B8 - f4 / 0.83 * sin\u03B8;
    res.b = e4 * sin\u03B8 + f4 / 0.83 * cos\u03B8;
    if (alpha !== void 0) res.alpha = alpha;
    return res;
  };
  var convertDlchToLab65_default = convertDlchToLab65;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/dlch/convertLab65ToDlch.js
  var convertLab65ToDlch = ({ l: l2, a: a2, b: b2, alpha }) => {
    if (l2 === void 0) l2 = 0;
    if (a2 === void 0) a2 = 0;
    if (b2 === void 0) b2 = 0;
    let e4 = a2 * cos\u03B8 + b2 * sin\u03B8;
    let f4 = 0.83 * (b2 * cos\u03B8 - a2 * sin\u03B8);
    let G = Math.sqrt(e4 * e4 + f4 * f4);
    let res = {
      mode: "dlch",
      l: factor / kE * Math.log(1 + 39e-4 * l2),
      c: Math.log(1 + 0.075 * G) / (0.0435 * kCH * kE)
    };
    if (res.c) {
      res.h = normalizeHue_default((Math.atan2(f4, e4) + \u03B8) / Math.PI * 180);
    }
    if (alpha !== void 0) res.alpha = alpha;
    return res;
  };
  var convertLab65ToDlch_default = convertLab65ToDlch;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/dlab/definition.js
  var convertDlabToLab65 = (c3) => convertDlchToLab65_default(convertLabToLch_default(c3, "dlch"));
  var convertLab65ToDlab = (c3) => convertLchToLab_default(convertLab65ToDlch_default(c3), "dlab");
  var definition4 = {
    mode: "dlab",
    parse: ["--din99o-lab"],
    serialize: "--din99o-lab",
    toMode: {
      lab65: convertDlabToLab65,
      rgb: (c3) => convertLab65ToRgb_default(convertDlabToLab65(c3))
    },
    fromMode: {
      lab65: convertLab65ToDlab,
      rgb: (c3) => convertLab65ToDlab(convertRgbToLab65_default(c3))
    },
    channels: ["l", "a", "b", "alpha"],
    ranges: {
      l: [0, 100],
      a: [-40.09, 45.501],
      b: [-40.469, 44.344]
    },
    interpolate: {
      l: interpolatorLinear,
      a: interpolatorLinear,
      b: interpolatorLinear,
      alpha: {
        use: interpolatorLinear,
        fixup: fixupAlpha
      }
    }
  };
  var definition_default4 = definition4;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/dlch/definition.js
  var definition5 = {
    mode: "dlch",
    parse: ["--din99o-lch"],
    serialize: "--din99o-lch",
    toMode: {
      lab65: convertDlchToLab65_default,
      dlab: (c3) => convertLchToLab_default(c3, "dlab"),
      rgb: (c3) => convertLab65ToRgb_default(convertDlchToLab65_default(c3))
    },
    fromMode: {
      lab65: convertLab65ToDlch_default,
      dlab: (c3) => convertLabToLch_default(c3, "dlch"),
      rgb: (c3) => convertLab65ToDlch_default(convertRgbToLab65_default(c3))
    },
    channels: ["l", "c", "h", "alpha"],
    ranges: {
      l: [0, 100],
      c: [0, 51.484],
      h: [0, 360]
    },
    interpolate: {
      l: interpolatorLinear,
      c: interpolatorLinear,
      h: {
        use: interpolatorLinear,
        fixup: fixupHueShorter
      },
      alpha: {
        use: interpolatorLinear,
        fixup: fixupAlpha
      }
    },
    difference: {
      h: differenceHueChroma
    },
    average: {
      h: averageAngle
    }
  };
  var definition_default5 = definition5;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/hsi/convertHsiToRgb.js
  function convertHsiToRgb({ h: h2, s, i, alpha }) {
    h2 = normalizeHue_default(h2 !== void 0 ? h2 : 0);
    if (s === void 0) s = 0;
    if (i === void 0) i = 0;
    let f4 = Math.abs(h2 / 60 % 2 - 1);
    let res;
    switch (Math.floor(h2 / 60)) {
      case 0:
        res = {
          r: i * (1 + s * (3 / (2 - f4) - 1)),
          g: i * (1 + s * (3 * (1 - f4) / (2 - f4) - 1)),
          b: i * (1 - s)
        };
        break;
      case 1:
        res = {
          r: i * (1 + s * (3 * (1 - f4) / (2 - f4) - 1)),
          g: i * (1 + s * (3 / (2 - f4) - 1)),
          b: i * (1 - s)
        };
        break;
      case 2:
        res = {
          r: i * (1 - s),
          g: i * (1 + s * (3 / (2 - f4) - 1)),
          b: i * (1 + s * (3 * (1 - f4) / (2 - f4) - 1))
        };
        break;
      case 3:
        res = {
          r: i * (1 - s),
          g: i * (1 + s * (3 * (1 - f4) / (2 - f4) - 1)),
          b: i * (1 + s * (3 / (2 - f4) - 1))
        };
        break;
      case 4:
        res = {
          r: i * (1 + s * (3 * (1 - f4) / (2 - f4) - 1)),
          g: i * (1 - s),
          b: i * (1 + s * (3 / (2 - f4) - 1))
        };
        break;
      case 5:
        res = {
          r: i * (1 + s * (3 / (2 - f4) - 1)),
          g: i * (1 - s),
          b: i * (1 + s * (3 * (1 - f4) / (2 - f4) - 1))
        };
        break;
      default:
        res = { r: i * (1 - s), g: i * (1 - s), b: i * (1 - s) };
    }
    res.mode = "rgb";
    if (alpha !== void 0) res.alpha = alpha;
    return res;
  }

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/hsi/convertRgbToHsi.js
  function convertRgbToHsi({ r, g: g2, b: b2, alpha }) {
    if (r === void 0) r = 0;
    if (g2 === void 0) g2 = 0;
    if (b2 === void 0) b2 = 0;
    let M4 = Math.max(r, g2, b2), m2 = Math.min(r, g2, b2);
    let res = {
      mode: "hsi",
      s: r + g2 + b2 === 0 ? 0 : 1 - 3 * m2 / (r + g2 + b2),
      i: (r + g2 + b2) / 3
    };
    if (M4 - m2 !== 0)
      res.h = (M4 === r ? (g2 - b2) / (M4 - m2) + (g2 < b2) * 6 : M4 === g2 ? (b2 - r) / (M4 - m2) + 2 : (r - g2) / (M4 - m2) + 4) * 60;
    if (alpha !== void 0) res.alpha = alpha;
    return res;
  }

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/hsi/definition.js
  var definition6 = {
    mode: "hsi",
    toMode: {
      rgb: convertHsiToRgb
    },
    parse: ["--hsi"],
    serialize: "--hsi",
    fromMode: {
      rgb: convertRgbToHsi
    },
    channels: ["h", "s", "i", "alpha"],
    ranges: {
      h: [0, 360]
    },
    gamut: "rgb",
    interpolate: {
      h: { use: interpolatorLinear, fixup: fixupHueShorter },
      s: interpolatorLinear,
      i: interpolatorLinear,
      alpha: { use: interpolatorLinear, fixup: fixupAlpha }
    },
    difference: {
      h: differenceHueSaturation
    },
    average: {
      h: averageAngle
    }
  };
  var definition_default6 = definition6;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/hsl/convertHslToRgb.js
  function convertHslToRgb({ h: h2, s, l: l2, alpha }) {
    h2 = normalizeHue_default(h2 !== void 0 ? h2 : 0);
    if (s === void 0) s = 0;
    if (l2 === void 0) l2 = 0;
    let m1 = l2 + s * (l2 < 0.5 ? l2 : 1 - l2);
    let m2 = m1 - (m1 - l2) * 2 * Math.abs(h2 / 60 % 2 - 1);
    let res;
    switch (Math.floor(h2 / 60)) {
      case 0:
        res = { r: m1, g: m2, b: 2 * l2 - m1 };
        break;
      case 1:
        res = { r: m2, g: m1, b: 2 * l2 - m1 };
        break;
      case 2:
        res = { r: 2 * l2 - m1, g: m1, b: m2 };
        break;
      case 3:
        res = { r: 2 * l2 - m1, g: m2, b: m1 };
        break;
      case 4:
        res = { r: m2, g: 2 * l2 - m1, b: m1 };
        break;
      case 5:
        res = { r: m1, g: 2 * l2 - m1, b: m2 };
        break;
      default:
        res = { r: 2 * l2 - m1, g: 2 * l2 - m1, b: 2 * l2 - m1 };
    }
    res.mode = "rgb";
    if (alpha !== void 0) res.alpha = alpha;
    return res;
  }

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/hsl/convertRgbToHsl.js
  function convertRgbToHsl({ r, g: g2, b: b2, alpha }) {
    if (r === void 0) r = 0;
    if (g2 === void 0) g2 = 0;
    if (b2 === void 0) b2 = 0;
    let M4 = Math.max(r, g2, b2), m2 = Math.min(r, g2, b2);
    let res = {
      mode: "hsl",
      s: M4 === m2 ? 0 : (M4 - m2) / (1 - Math.abs(M4 + m2 - 1)),
      l: 0.5 * (M4 + m2)
    };
    if (M4 - m2 !== 0)
      res.h = (M4 === r ? (g2 - b2) / (M4 - m2) + (g2 < b2) * 6 : M4 === g2 ? (b2 - r) / (M4 - m2) + 2 : (r - g2) / (M4 - m2) + 4) * 60;
    if (alpha !== void 0) res.alpha = alpha;
    return res;
  }

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/util/hue.js
  var hueToDeg = (val, unit) => {
    switch (unit) {
      case "deg":
        return +val;
      case "rad":
        return val / Math.PI * 180;
      case "grad":
        return val / 10 * 9;
      case "turn":
        return val * 360;
    }
  };
  var hue_default = hueToDeg;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/hsl/parseHslLegacy.js
  var hsl_old = new RegExp(
    `^hsla?\\(\\s*${hue}${c}${per}${c}${per}\\s*(?:,\\s*${num_per}\\s*)?\\)$`
  );
  var parseHslLegacy = (color) => {
    let match = color.match(hsl_old);
    if (!match) return;
    let res = { mode: "hsl" };
    if (match[3] !== void 0) {
      res.h = +match[3];
    } else if (match[1] !== void 0 && match[2] !== void 0) {
      res.h = hue_default(match[1], match[2]);
    }
    if (match[4] !== void 0) {
      res.s = Math.min(Math.max(0, match[4] / 100), 1);
    }
    if (match[5] !== void 0) {
      res.l = Math.min(Math.max(0, match[5] / 100), 1);
    }
    if (match[6] !== void 0) {
      res.alpha = Math.max(0, Math.min(1, match[6] / 100));
    } else if (match[7] !== void 0) {
      res.alpha = Math.max(0, Math.min(1, +match[7]));
    }
    return res;
  };
  var parseHslLegacy_default = parseHslLegacy;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/hsl/parseHsl.js
  function parseHsl(color, parsed) {
    if (!parsed || parsed[0] !== "hsl" && parsed[0] !== "hsla") {
      return void 0;
    }
    const res = { mode: "hsl" };
    const [, h2, s, l2, alpha] = parsed;
    if (h2.type !== Tok.None) {
      if (h2.type === Tok.Percentage) {
        return void 0;
      }
      res.h = h2.value;
    }
    if (s.type !== Tok.None) {
      if (s.type === Tok.Hue) {
        return void 0;
      }
      res.s = s.value / 100;
    }
    if (l2.type !== Tok.None) {
      if (l2.type === Tok.Hue) {
        return void 0;
      }
      res.l = l2.value / 100;
    }
    if (alpha.type !== Tok.None) {
      res.alpha = Math.min(
        1,
        Math.max(
          0,
          alpha.type === Tok.Number ? alpha.value : alpha.value / 100
        )
      );
    }
    return res;
  }
  var parseHsl_default = parseHsl;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/hsl/definition.js
  var definition7 = {
    mode: "hsl",
    toMode: {
      rgb: convertHslToRgb
    },
    fromMode: {
      rgb: convertRgbToHsl
    },
    channels: ["h", "s", "l", "alpha"],
    ranges: {
      h: [0, 360]
    },
    gamut: "rgb",
    parse: [parseHsl_default, parseHslLegacy_default],
    serialize: (c3) => `hsl(${c3.h !== void 0 ? c3.h : "none"} ${c3.s !== void 0 ? c3.s * 100 + "%" : "none"} ${c3.l !== void 0 ? c3.l * 100 + "%" : "none"}${c3.alpha < 1 ? ` / ${c3.alpha}` : ""})`,
    interpolate: {
      h: { use: interpolatorLinear, fixup: fixupHueShorter },
      s: interpolatorLinear,
      l: interpolatorLinear,
      alpha: { use: interpolatorLinear, fixup: fixupAlpha }
    },
    difference: {
      h: differenceHueSaturation
    },
    average: {
      h: averageAngle
    }
  };
  var definition_default7 = definition7;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/hsv/convertHsvToRgb.js
  function convertHsvToRgb({ h: h2, s, v: v2, alpha }) {
    h2 = normalizeHue_default(h2 !== void 0 ? h2 : 0);
    if (s === void 0) s = 0;
    if (v2 === void 0) v2 = 0;
    let f4 = Math.abs(h2 / 60 % 2 - 1);
    let res;
    switch (Math.floor(h2 / 60)) {
      case 0:
        res = { r: v2, g: v2 * (1 - s * f4), b: v2 * (1 - s) };
        break;
      case 1:
        res = { r: v2 * (1 - s * f4), g: v2, b: v2 * (1 - s) };
        break;
      case 2:
        res = { r: v2 * (1 - s), g: v2, b: v2 * (1 - s * f4) };
        break;
      case 3:
        res = { r: v2 * (1 - s), g: v2 * (1 - s * f4), b: v2 };
        break;
      case 4:
        res = { r: v2 * (1 - s * f4), g: v2 * (1 - s), b: v2 };
        break;
      case 5:
        res = { r: v2, g: v2 * (1 - s), b: v2 * (1 - s * f4) };
        break;
      default:
        res = { r: v2 * (1 - s), g: v2 * (1 - s), b: v2 * (1 - s) };
    }
    res.mode = "rgb";
    if (alpha !== void 0) res.alpha = alpha;
    return res;
  }

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/hsv/convertRgbToHsv.js
  function convertRgbToHsv({ r, g: g2, b: b2, alpha }) {
    if (r === void 0) r = 0;
    if (g2 === void 0) g2 = 0;
    if (b2 === void 0) b2 = 0;
    let M4 = Math.max(r, g2, b2), m2 = Math.min(r, g2, b2);
    let res = {
      mode: "hsv",
      s: M4 === 0 ? 0 : 1 - m2 / M4,
      v: M4
    };
    if (M4 - m2 !== 0)
      res.h = (M4 === r ? (g2 - b2) / (M4 - m2) + (g2 < b2) * 6 : M4 === g2 ? (b2 - r) / (M4 - m2) + 2 : (r - g2) / (M4 - m2) + 4) * 60;
    if (alpha !== void 0) res.alpha = alpha;
    return res;
  }

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/hsv/definition.js
  var definition8 = {
    mode: "hsv",
    toMode: {
      rgb: convertHsvToRgb
    },
    parse: ["--hsv"],
    serialize: "--hsv",
    fromMode: {
      rgb: convertRgbToHsv
    },
    channels: ["h", "s", "v", "alpha"],
    ranges: {
      h: [0, 360]
    },
    gamut: "rgb",
    interpolate: {
      h: { use: interpolatorLinear, fixup: fixupHueShorter },
      s: interpolatorLinear,
      v: interpolatorLinear,
      alpha: { use: interpolatorLinear, fixup: fixupAlpha }
    },
    difference: {
      h: differenceHueSaturation
    },
    average: {
      h: averageAngle
    }
  };
  var definition_default8 = definition8;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/hwb/convertHwbToRgb.js
  function convertHwbToRgb({ h: h2, w, b: b2, alpha }) {
    if (w === void 0) w = 0;
    if (b2 === void 0) b2 = 0;
    if (w + b2 > 1) {
      let s = w + b2;
      w /= s;
      b2 /= s;
    }
    return convertHsvToRgb({
      h: h2,
      s: b2 === 1 ? 1 : 1 - w / (1 - b2),
      v: 1 - b2,
      alpha
    });
  }

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/hwb/convertRgbToHwb.js
  function convertRgbToHwb(rgba) {
    let hsv2 = convertRgbToHsv(rgba);
    if (hsv2 === void 0) return void 0;
    let s = hsv2.s !== void 0 ? hsv2.s : 0;
    let v2 = hsv2.v !== void 0 ? hsv2.v : 0;
    let res = {
      mode: "hwb",
      w: (1 - s) * v2,
      b: 1 - v2
    };
    if (hsv2.h !== void 0) res.h = hsv2.h;
    if (hsv2.alpha !== void 0) res.alpha = hsv2.alpha;
    return res;
  }

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/hwb/parseHwb.js
  function ParseHwb(color, parsed) {
    if (!parsed || parsed[0] !== "hwb") {
      return void 0;
    }
    const res = { mode: "hwb" };
    const [, h2, w, b2, alpha] = parsed;
    if (h2.type !== Tok.None) {
      if (h2.type === Tok.Percentage) {
        return void 0;
      }
      res.h = h2.value;
    }
    if (w.type !== Tok.None) {
      if (w.type === Tok.Hue) {
        return void 0;
      }
      res.w = w.value / 100;
    }
    if (b2.type !== Tok.None) {
      if (b2.type === Tok.Hue) {
        return void 0;
      }
      res.b = b2.value / 100;
    }
    if (alpha.type !== Tok.None) {
      res.alpha = Math.min(
        1,
        Math.max(
          0,
          alpha.type === Tok.Number ? alpha.value : alpha.value / 100
        )
      );
    }
    return res;
  }
  var parseHwb_default = ParseHwb;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/hwb/definition.js
  var definition9 = {
    mode: "hwb",
    toMode: {
      rgb: convertHwbToRgb
    },
    fromMode: {
      rgb: convertRgbToHwb
    },
    channels: ["h", "w", "b", "alpha"],
    ranges: {
      h: [0, 360]
    },
    gamut: "rgb",
    parse: [parseHwb_default],
    serialize: (c3) => `hwb(${c3.h !== void 0 ? c3.h : "none"} ${c3.w !== void 0 ? c3.w * 100 + "%" : "none"} ${c3.b !== void 0 ? c3.b * 100 + "%" : "none"}${c3.alpha < 1 ? ` / ${c3.alpha}` : ""})`,
    interpolate: {
      h: { use: interpolatorLinear, fixup: fixupHueShorter },
      w: interpolatorLinear,
      b: interpolatorLinear,
      alpha: { use: interpolatorLinear, fixup: fixupAlpha }
    },
    difference: {
      h: differenceHueNaive
    },
    average: {
      h: averageAngle
    }
  };
  var definition_default9 = definition9;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/hdr/constants.js
  var YW = 203;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/hdr/transfer.js
  var M1 = 0.1593017578125;
  var M2 = 78.84375;
  var C1 = 0.8359375;
  var C2 = 18.8515625;
  var C3 = 18.6875;
  function transferPqDecode(v2) {
    if (v2 < 0) return 0;
    const c3 = Math.pow(v2, 1 / M2);
    return 1e4 * Math.pow(Math.max(0, c3 - C1) / (C2 - C3 * c3), 1 / M1);
  }
  function transferPqEncode(v2) {
    if (v2 < 0) return 0;
    const c3 = Math.pow(v2 / 1e4, M1);
    return Math.pow((C1 + C2 * c3) / (1 + C3 * c3), M2);
  }

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/itp/convertItpToXyz65.js
  var toRel = (c3) => Math.max(c3 / YW, 0);
  var convertItpToXyz65 = ({ i, t, p: p5, alpha }) => {
    if (i === void 0) i = 0;
    if (t === void 0) t = 0;
    if (p5 === void 0) p5 = 0;
    const l2 = transferPqDecode(
      i + 0.008609037037932761 * t + 0.11102962500302593 * p5
    );
    const m2 = transferPqDecode(
      i - 0.00860903703793275 * t - 0.11102962500302599 * p5
    );
    const s = transferPqDecode(
      i + 0.5600313357106791 * t - 0.32062717498731885 * p5
    );
    const res = {
      mode: "xyz65",
      x: toRel(
        2.070152218389422 * l2 - 1.3263473389671556 * m2 + 0.2066510476294051 * s
      ),
      y: toRel(
        0.3647385209748074 * l2 + 0.680566024947227 * m2 - 0.0453045459220346 * s
      ),
      z: toRel(
        -0.049747207535812 * l2 - 0.0492609666966138 * m2 + 1.1880659249923042 * s
      )
    };
    if (alpha !== void 0) {
      res.alpha = alpha;
    }
    return res;
  };
  var convertItpToXyz65_default = convertItpToXyz65;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/itp/convertXyz65ToItp.js
  var toAbs = (c3 = 0) => Math.max(c3 * YW, 0);
  var convertXyz65ToItp = ({ x: x2, y: y2, z, alpha }) => {
    const absX = toAbs(x2);
    const absY = toAbs(y2);
    const absZ = toAbs(z);
    const l2 = transferPqEncode(
      0.3592832590121217 * absX + 0.6976051147779502 * absY - 0.0358915932320289 * absZ
    );
    const m2 = transferPqEncode(
      -0.1920808463704995 * absX + 1.1004767970374323 * absY + 0.0753748658519118 * absZ
    );
    const s = transferPqEncode(
      0.0070797844607477 * absX + 0.0748396662186366 * absY + 0.8433265453898765 * absZ
    );
    const i = 0.5 * l2 + 0.5 * m2;
    const t = 1.61376953125 * l2 - 3.323486328125 * m2 + 1.709716796875 * s;
    const p5 = 4.378173828125 * l2 - 4.24560546875 * m2 - 0.132568359375 * s;
    const res = { mode: "itp", i, t, p: p5 };
    if (alpha !== void 0) {
      res.alpha = alpha;
    }
    return res;
  };
  var convertXyz65ToItp_default = convertXyz65ToItp;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/itp/definition.js
  var definition10 = {
    mode: "itp",
    channels: ["i", "t", "p", "alpha"],
    parse: ["--ictcp"],
    serialize: "--ictcp",
    toMode: {
      xyz65: convertItpToXyz65_default,
      rgb: (color) => convertXyz65ToRgb_default(convertItpToXyz65_default(color))
    },
    fromMode: {
      xyz65: convertXyz65ToItp_default,
      rgb: (color) => convertXyz65ToItp_default(convertRgbToXyz65_default(color))
    },
    ranges: {
      i: [0, 0.581],
      t: [-0.369, 0.272],
      p: [-0.164, 0.331]
    },
    interpolate: {
      i: interpolatorLinear,
      t: interpolatorLinear,
      p: interpolatorLinear,
      alpha: { use: interpolatorLinear, fixup: fixupAlpha }
    }
  };
  var definition_default10 = definition10;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/jab/convertXyz65ToJab.js
  var p = 134.03437499999998;
  var d0 = 16295499532821565e-27;
  var jabPqEncode = (v2) => {
    if (v2 < 0) return 0;
    let vn3 = Math.pow(v2 / 1e4, M1);
    return Math.pow((C1 + C2 * vn3) / (1 + C3 * vn3), p);
  };
  var abs = (v2 = 0) => Math.max(v2 * 203, 0);
  var convertXyz65ToJab = ({ x: x2, y: y2, z, alpha }) => {
    x2 = abs(x2);
    y2 = abs(y2);
    z = abs(z);
    let xp = 1.15 * x2 - 0.15 * z;
    let yp = 0.66 * y2 + 0.34 * x2;
    let l2 = jabPqEncode(0.41478972 * xp + 0.579999 * yp + 0.014648 * z);
    let m2 = jabPqEncode(-0.20151 * xp + 1.120649 * yp + 0.0531008 * z);
    let s = jabPqEncode(-0.0166008 * xp + 0.2648 * yp + 0.6684799 * z);
    let i = (l2 + m2) / 2;
    let res = {
      mode: "jab",
      j: 0.44 * i / (1 - 0.56 * i) - d0,
      a: 3.524 * l2 - 4.066708 * m2 + 0.542708 * s,
      b: 0.199076 * l2 + 1.096799 * m2 - 1.295875 * s
    };
    if (alpha !== void 0) {
      res.alpha = alpha;
    }
    return res;
  };
  var convertXyz65ToJab_default = convertXyz65ToJab;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/jab/convertJabToXyz65.js
  var p2 = 134.03437499999998;
  var d02 = 16295499532821565e-27;
  var jabPqDecode = (v2) => {
    if (v2 < 0) return 0;
    let vp = Math.pow(v2, 1 / p2);
    return 1e4 * Math.pow((C1 - vp) / (C3 * vp - C2), 1 / M1);
  };
  var rel = (v2) => v2 / 203;
  var convertJabToXyz65 = ({ j, a: a2, b: b2, alpha }) => {
    if (j === void 0) j = 0;
    if (a2 === void 0) a2 = 0;
    if (b2 === void 0) b2 = 0;
    let i = (j + d02) / (0.44 + 0.56 * (j + d02));
    let l2 = jabPqDecode(i + 0.13860504 * a2 + 0.058047316 * b2);
    let m2 = jabPqDecode(i - 0.13860504 * a2 - 0.058047316 * b2);
    let s = jabPqDecode(i - 0.096019242 * a2 - 0.8118919 * b2);
    let res = {
      mode: "xyz65",
      x: rel(
        1.661373024652174 * l2 - 0.914523081304348 * m2 + 0.23136208173913045 * s
      ),
      y: rel(
        -0.3250758611844533 * l2 + 1.571847026732543 * m2 - 0.21825383453227928 * s
      ),
      z: rel(-0.090982811 * l2 - 0.31272829 * m2 + 1.5227666 * s)
    };
    if (alpha !== void 0) {
      res.alpha = alpha;
    }
    return res;
  };
  var convertJabToXyz65_default = convertJabToXyz65;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/jab/convertRgbToJab.js
  var convertRgbToJab = (rgb2) => {
    let res = convertXyz65ToJab_default(convertRgbToXyz65_default(rgb2));
    if (rgb2.r === rgb2.b && rgb2.b === rgb2.g) {
      res.a = res.b = 0;
    }
    return res;
  };
  var convertRgbToJab_default = convertRgbToJab;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/jab/convertJabToRgb.js
  var convertJabToRgb = (color) => convertXyz65ToRgb_default(convertJabToXyz65_default(color));
  var convertJabToRgb_default = convertJabToRgb;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/jab/definition.js
  var definition11 = {
    mode: "jab",
    channels: ["j", "a", "b", "alpha"],
    parse: ["--jzazbz"],
    serialize: "--jzazbz",
    fromMode: {
      rgb: convertRgbToJab_default,
      xyz65: convertXyz65ToJab_default
    },
    toMode: {
      rgb: convertJabToRgb_default,
      xyz65: convertJabToXyz65_default
    },
    ranges: {
      j: [0, 0.222],
      a: [-0.109, 0.129],
      b: [-0.185, 0.134]
    },
    interpolate: {
      j: interpolatorLinear,
      a: interpolatorLinear,
      b: interpolatorLinear,
      alpha: { use: interpolatorLinear, fixup: fixupAlpha }
    }
  };
  var definition_default11 = definition11;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/jch/convertJabToJch.js
  var convertJabToJch = ({ j, a: a2, b: b2, alpha }) => {
    if (a2 === void 0) a2 = 0;
    if (b2 === void 0) b2 = 0;
    let c3 = Math.sqrt(a2 * a2 + b2 * b2);
    let res = {
      mode: "jch",
      j,
      c: c3
    };
    if (c3) {
      res.h = normalizeHue_default(Math.atan2(b2, a2) * 180 / Math.PI);
    }
    if (alpha !== void 0) {
      res.alpha = alpha;
    }
    return res;
  };
  var convertJabToJch_default = convertJabToJch;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/jch/convertJchToJab.js
  var convertJchToJab = ({ j, c: c3, h: h2, alpha }) => {
    if (h2 === void 0) h2 = 0;
    let res = {
      mode: "jab",
      j,
      a: c3 ? c3 * Math.cos(h2 / 180 * Math.PI) : 0,
      b: c3 ? c3 * Math.sin(h2 / 180 * Math.PI) : 0
    };
    if (alpha !== void 0) res.alpha = alpha;
    return res;
  };
  var convertJchToJab_default = convertJchToJab;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/jch/definition.js
  var definition12 = {
    mode: "jch",
    parse: ["--jzczhz"],
    serialize: "--jzczhz",
    toMode: {
      jab: convertJchToJab_default,
      rgb: (c3) => convertJabToRgb_default(convertJchToJab_default(c3))
    },
    fromMode: {
      rgb: (c3) => convertJabToJch_default(convertRgbToJab_default(c3)),
      jab: convertJabToJch_default
    },
    channels: ["j", "c", "h", "alpha"],
    ranges: {
      j: [0, 0.221],
      c: [0, 0.19],
      h: [0, 360]
    },
    interpolate: {
      h: { use: interpolatorLinear, fixup: fixupHueShorter },
      c: interpolatorLinear,
      j: interpolatorLinear,
      alpha: { use: interpolatorLinear, fixup: fixupAlpha }
    },
    difference: {
      h: differenceHueChroma
    },
    average: {
      h: averageAngle
    }
  };
  var definition_default12 = definition12;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/xyz50/constants.js
  var k3 = Math.pow(29, 3) / Math.pow(3, 3);
  var e3 = Math.pow(6, 3) / Math.pow(29, 3);

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/lab/convertLabToXyz50.js
  var fn4 = (v2) => Math.pow(v2, 3) > e3 ? Math.pow(v2, 3) : (116 * v2 - 16) / k3;
  var convertLabToXyz50 = ({ l: l2, a: a2, b: b2, alpha }) => {
    if (l2 === void 0) l2 = 0;
    if (a2 === void 0) a2 = 0;
    if (b2 === void 0) b2 = 0;
    let fy = (l2 + 16) / 116;
    let fx = a2 / 500 + fy;
    let fz = fy - b2 / 200;
    let res = {
      mode: "xyz50",
      x: fn4(fx) * D50.X,
      y: fn4(fy) * D50.Y,
      z: fn4(fz) * D50.Z
    };
    if (alpha !== void 0) {
      res.alpha = alpha;
    }
    return res;
  };
  var convertLabToXyz50_default = convertLabToXyz50;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/xyz50/convertXyz50ToRgb.js
  var convertXyz50ToRgb = ({ x: x2, y: y2, z, alpha }) => {
    if (x2 === void 0) x2 = 0;
    if (y2 === void 0) y2 = 0;
    if (z === void 0) z = 0;
    let res = convertLrgbToRgb_default({
      r: x2 * 3.1341359569958707 - y2 * 1.6173863321612538 - 0.4906619460083532 * z,
      g: x2 * -0.978795502912089 + y2 * 1.916254567259524 + 0.03344273116131949 * z,
      b: x2 * 0.07195537988411677 - y2 * 0.2289768264158322 + 1.405386058324125 * z
    });
    if (alpha !== void 0) {
      res.alpha = alpha;
    }
    return res;
  };
  var convertXyz50ToRgb_default = convertXyz50ToRgb;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/lab/convertLabToRgb.js
  var convertLabToRgb = (lab2) => convertXyz50ToRgb_default(convertLabToXyz50_default(lab2));
  var convertLabToRgb_default = convertLabToRgb;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/xyz50/convertRgbToXyz50.js
  var convertRgbToXyz50 = (rgb2) => {
    let { r, g: g2, b: b2, alpha } = convertRgbToLrgb_default(rgb2);
    let res = {
      mode: "xyz50",
      x: 0.436065742824811 * r + 0.3851514688337912 * g2 + 0.14307845442264197 * b2,
      y: 0.22249319175623702 * r + 0.7168870538238823 * g2 + 0.06061979053616537 * b2,
      z: 0.013923904500943465 * r + 0.09708128566574634 * g2 + 0.7140993584005155 * b2
    };
    if (alpha !== void 0) {
      res.alpha = alpha;
    }
    return res;
  };
  var convertRgbToXyz50_default = convertRgbToXyz50;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/lab/convertXyz50ToLab.js
  var f2 = (value) => value > e3 ? Math.cbrt(value) : (k3 * value + 16) / 116;
  var convertXyz50ToLab = ({ x: x2, y: y2, z, alpha }) => {
    if (x2 === void 0) x2 = 0;
    if (y2 === void 0) y2 = 0;
    if (z === void 0) z = 0;
    let f0 = f2(x2 / D50.X);
    let f1 = f2(y2 / D50.Y);
    let f22 = f2(z / D50.Z);
    let res = {
      mode: "lab",
      l: 116 * f1 - 16,
      a: 500 * (f0 - f1),
      b: 200 * (f1 - f22)
    };
    if (alpha !== void 0) {
      res.alpha = alpha;
    }
    return res;
  };
  var convertXyz50ToLab_default = convertXyz50ToLab;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/lab/convertRgbToLab.js
  var convertRgbToLab = (rgb2) => {
    let res = convertXyz50ToLab_default(convertRgbToXyz50_default(rgb2));
    if (rgb2.r === rgb2.b && rgb2.b === rgb2.g) {
      res.a = res.b = 0;
    }
    return res;
  };
  var convertRgbToLab_default = convertRgbToLab;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/lab/parseLab.js
  function parseLab(color, parsed) {
    if (!parsed || parsed[0] !== "lab") {
      return void 0;
    }
    const res = { mode: "lab" };
    const [, l2, a2, b2, alpha] = parsed;
    if (l2.type === Tok.Hue || a2.type === Tok.Hue || b2.type === Tok.Hue) {
      return void 0;
    }
    if (l2.type !== Tok.None) {
      res.l = Math.min(Math.max(0, l2.value), 100);
    }
    if (a2.type !== Tok.None) {
      res.a = a2.type === Tok.Number ? a2.value : a2.value * 125 / 100;
    }
    if (b2.type !== Tok.None) {
      res.b = b2.type === Tok.Number ? b2.value : b2.value * 125 / 100;
    }
    if (alpha.type !== Tok.None) {
      res.alpha = Math.min(
        1,
        Math.max(
          0,
          alpha.type === Tok.Number ? alpha.value : alpha.value / 100
        )
      );
    }
    return res;
  }
  var parseLab_default = parseLab;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/lab/definition.js
  var definition13 = {
    mode: "lab",
    toMode: {
      xyz50: convertLabToXyz50_default,
      rgb: convertLabToRgb_default
    },
    fromMode: {
      xyz50: convertXyz50ToLab_default,
      rgb: convertRgbToLab_default
    },
    channels: ["l", "a", "b", "alpha"],
    ranges: {
      l: [0, 100],
      a: [-125, 125],
      b: [-125, 125]
    },
    parse: [parseLab_default],
    serialize: (c3) => `lab(${c3.l !== void 0 ? c3.l : "none"} ${c3.a !== void 0 ? c3.a : "none"} ${c3.b !== void 0 ? c3.b : "none"}${c3.alpha < 1 ? ` / ${c3.alpha}` : ""})`,
    interpolate: {
      l: interpolatorLinear,
      a: interpolatorLinear,
      b: interpolatorLinear,
      alpha: { use: interpolatorLinear, fixup: fixupAlpha }
    }
  };
  var definition_default13 = definition13;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/lab65/definition.js
  var definition14 = __spreadProps(__spreadValues({}, definition_default13), {
    mode: "lab65",
    parse: ["--lab-d65"],
    serialize: "--lab-d65",
    toMode: {
      xyz65: convertLab65ToXyz65_default,
      rgb: convertLab65ToRgb_default
    },
    fromMode: {
      xyz65: convertXyz65ToLab65_default,
      rgb: convertRgbToLab65_default
    },
    ranges: {
      l: [0, 100],
      a: [-125, 125],
      b: [-125, 125]
    }
  });
  var definition_default14 = definition14;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/lch/parseLch.js
  function parseLch(color, parsed) {
    if (!parsed || parsed[0] !== "lch") {
      return void 0;
    }
    const res = { mode: "lch" };
    const [, l2, c3, h2, alpha] = parsed;
    if (l2.type !== Tok.None) {
      if (l2.type === Tok.Hue) {
        return void 0;
      }
      res.l = Math.min(Math.max(0, l2.value), 100);
    }
    if (c3.type !== Tok.None) {
      res.c = Math.max(
        0,
        c3.type === Tok.Number ? c3.value : c3.value * 150 / 100
      );
    }
    if (h2.type !== Tok.None) {
      if (h2.type === Tok.Percentage) {
        return void 0;
      }
      res.h = h2.value;
    }
    if (alpha.type !== Tok.None) {
      res.alpha = Math.min(
        1,
        Math.max(
          0,
          alpha.type === Tok.Number ? alpha.value : alpha.value / 100
        )
      );
    }
    return res;
  }
  var parseLch_default = parseLch;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/lch/definition.js
  var definition15 = {
    mode: "lch",
    toMode: {
      lab: convertLchToLab_default,
      rgb: (c3) => convertLabToRgb_default(convertLchToLab_default(c3))
    },
    fromMode: {
      rgb: (c3) => convertLabToLch_default(convertRgbToLab_default(c3)),
      lab: convertLabToLch_default
    },
    channels: ["l", "c", "h", "alpha"],
    ranges: {
      l: [0, 100],
      c: [0, 150],
      h: [0, 360]
    },
    parse: [parseLch_default],
    serialize: (c3) => `lch(${c3.l !== void 0 ? c3.l : "none"} ${c3.c !== void 0 ? c3.c : "none"} ${c3.h !== void 0 ? c3.h : "none"}${c3.alpha < 1 ? ` / ${c3.alpha}` : ""})`,
    interpolate: {
      h: { use: interpolatorLinear, fixup: fixupHueShorter },
      c: interpolatorLinear,
      l: interpolatorLinear,
      alpha: { use: interpolatorLinear, fixup: fixupAlpha }
    },
    difference: {
      h: differenceHueChroma
    },
    average: {
      h: averageAngle
    }
  };
  var definition_default15 = definition15;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/lch65/definition.js
  var definition16 = __spreadProps(__spreadValues({}, definition_default15), {
    mode: "lch65",
    parse: ["--lch-d65"],
    serialize: "--lch-d65",
    toMode: {
      lab65: (c3) => convertLchToLab_default(c3, "lab65"),
      rgb: (c3) => convertLab65ToRgb_default(convertLchToLab_default(c3, "lab65"))
    },
    fromMode: {
      rgb: (c3) => convertLabToLch_default(convertRgbToLab65_default(c3), "lch65"),
      lab65: (c3) => convertLabToLch_default(c3, "lch65")
    },
    ranges: {
      l: [0, 100],
      c: [0, 150],
      h: [0, 360]
    }
  });
  var definition_default16 = definition16;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/lchuv/convertLuvToLchuv.js
  var convertLuvToLchuv = ({ l: l2, u, v: v2, alpha }) => {
    if (u === void 0) u = 0;
    if (v2 === void 0) v2 = 0;
    let c3 = Math.sqrt(u * u + v2 * v2);
    let res = {
      mode: "lchuv",
      l: l2,
      c: c3
    };
    if (c3) {
      res.h = normalizeHue_default(Math.atan2(v2, u) * 180 / Math.PI);
    }
    if (alpha !== void 0) {
      res.alpha = alpha;
    }
    return res;
  };
  var convertLuvToLchuv_default = convertLuvToLchuv;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/lchuv/convertLchuvToLuv.js
  var convertLchuvToLuv = ({ l: l2, c: c3, h: h2, alpha }) => {
    if (h2 === void 0) h2 = 0;
    let res = {
      mode: "luv",
      l: l2,
      u: c3 ? c3 * Math.cos(h2 / 180 * Math.PI) : 0,
      v: c3 ? c3 * Math.sin(h2 / 180 * Math.PI) : 0
    };
    if (alpha !== void 0) {
      res.alpha = alpha;
    }
    return res;
  };
  var convertLchuvToLuv_default = convertLchuvToLuv;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/luv/convertXyz50ToLuv.js
  var u_fn = (x2, y2, z) => 4 * x2 / (x2 + 15 * y2 + 3 * z);
  var v_fn = (x2, y2, z) => 9 * y2 / (x2 + 15 * y2 + 3 * z);
  var un = u_fn(D50.X, D50.Y, D50.Z);
  var vn = v_fn(D50.X, D50.Y, D50.Z);
  var l_fn = (value) => value <= e3 ? k3 * value : 116 * Math.cbrt(value) - 16;
  var convertXyz50ToLuv = ({ x: x2, y: y2, z, alpha }) => {
    if (x2 === void 0) x2 = 0;
    if (y2 === void 0) y2 = 0;
    if (z === void 0) z = 0;
    let l2 = l_fn(y2 / D50.Y);
    let u = u_fn(x2, y2, z);
    let v2 = v_fn(x2, y2, z);
    if (!isFinite(u) || !isFinite(v2)) {
      l2 = u = v2 = 0;
    } else {
      u = 13 * l2 * (u - un);
      v2 = 13 * l2 * (v2 - vn);
    }
    let res = {
      mode: "luv",
      l: l2,
      u,
      v: v2
    };
    if (alpha !== void 0) {
      res.alpha = alpha;
    }
    return res;
  };
  var convertXyz50ToLuv_default = convertXyz50ToLuv;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/luv/convertLuvToXyz50.js
  var u_fn2 = (x2, y2, z) => 4 * x2 / (x2 + 15 * y2 + 3 * z);
  var v_fn2 = (x2, y2, z) => 9 * y2 / (x2 + 15 * y2 + 3 * z);
  var un2 = u_fn2(D50.X, D50.Y, D50.Z);
  var vn2 = v_fn2(D50.X, D50.Y, D50.Z);
  var convertLuvToXyz50 = ({ l: l2, u, v: v2, alpha }) => {
    if (l2 === void 0) l2 = 0;
    if (l2 === 0) {
      return { mode: "xyz50", x: 0, y: 0, z: 0 };
    }
    if (u === void 0) u = 0;
    if (v2 === void 0) v2 = 0;
    let up = u / (13 * l2) + un2;
    let vp = v2 / (13 * l2) + vn2;
    let y2 = D50.Y * (l2 <= 8 ? l2 / k3 : Math.pow((l2 + 16) / 116, 3));
    let x2 = y2 * (9 * up) / (4 * vp);
    let z = y2 * (12 - 3 * up - 20 * vp) / (4 * vp);
    let res = { mode: "xyz50", x: x2, y: y2, z };
    if (alpha !== void 0) {
      res.alpha = alpha;
    }
    return res;
  };
  var convertLuvToXyz50_default = convertLuvToXyz50;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/lchuv/definition.js
  var convertRgbToLchuv = (rgb2) => convertLuvToLchuv_default(convertXyz50ToLuv_default(convertRgbToXyz50_default(rgb2)));
  var convertLchuvToRgb = (lchuv2) => convertXyz50ToRgb_default(convertLuvToXyz50_default(convertLchuvToLuv_default(lchuv2)));
  var definition17 = {
    mode: "lchuv",
    toMode: {
      luv: convertLchuvToLuv_default,
      rgb: convertLchuvToRgb
    },
    fromMode: {
      rgb: convertRgbToLchuv,
      luv: convertLuvToLchuv_default
    },
    channels: ["l", "c", "h", "alpha"],
    parse: ["--lchuv"],
    serialize: "--lchuv",
    ranges: {
      l: [0, 100],
      c: [0, 176.956],
      h: [0, 360]
    },
    interpolate: {
      h: { use: interpolatorLinear, fixup: fixupHueShorter },
      c: interpolatorLinear,
      l: interpolatorLinear,
      alpha: { use: interpolatorLinear, fixup: fixupAlpha }
    },
    difference: {
      h: differenceHueChroma
    },
    average: {
      h: averageAngle
    }
  };
  var definition_default17 = definition17;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/lrgb/definition.js
  var definition18 = __spreadProps(__spreadValues({}, definition_default), {
    mode: "lrgb",
    toMode: {
      rgb: convertLrgbToRgb_default
    },
    fromMode: {
      rgb: convertRgbToLrgb_default
    },
    parse: ["srgb-linear"],
    serialize: "srgb-linear"
  });
  var definition_default18 = definition18;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/luv/definition.js
  var definition19 = {
    mode: "luv",
    toMode: {
      xyz50: convertLuvToXyz50_default,
      rgb: (luv2) => convertXyz50ToRgb_default(convertLuvToXyz50_default(luv2))
    },
    fromMode: {
      xyz50: convertXyz50ToLuv_default,
      rgb: (rgb2) => convertXyz50ToLuv_default(convertRgbToXyz50_default(rgb2))
    },
    channels: ["l", "u", "v", "alpha"],
    parse: ["--luv"],
    serialize: "--luv",
    ranges: {
      l: [0, 100],
      u: [-84.936, 175.042],
      v: [-125.882, 87.243]
    },
    interpolate: {
      l: interpolatorLinear,
      u: interpolatorLinear,
      v: interpolatorLinear,
      alpha: { use: interpolatorLinear, fixup: fixupAlpha }
    }
  };
  var definition_default19 = definition19;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/oklab/convertLrgbToOklab.js
  var convertLrgbToOklab = ({ r, g: g2, b: b2, alpha }) => {
    if (r === void 0) r = 0;
    if (g2 === void 0) g2 = 0;
    if (b2 === void 0) b2 = 0;
    let L2 = Math.cbrt(
      0.412221469470763 * r + 0.5363325372617348 * g2 + 0.0514459932675022 * b2
    );
    let M4 = Math.cbrt(
      0.2119034958178252 * r + 0.6806995506452344 * g2 + 0.1073969535369406 * b2
    );
    let S2 = Math.cbrt(
      0.0883024591900564 * r + 0.2817188391361215 * g2 + 0.6299787016738222 * b2
    );
    let res = {
      mode: "oklab",
      l: 0.210454268309314 * L2 + 0.7936177747023054 * M4 - 0.0040720430116193 * S2,
      a: 1.9779985324311684 * L2 - 2.42859224204858 * M4 + 0.450593709617411 * S2,
      b: 0.0259040424655478 * L2 + 0.7827717124575296 * M4 - 0.8086757549230774 * S2
    };
    if (alpha !== void 0) {
      res.alpha = alpha;
    }
    return res;
  };
  var convertLrgbToOklab_default = convertLrgbToOklab;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/oklab/convertRgbToOklab.js
  var convertRgbToOklab = (rgb2) => {
    let res = convertLrgbToOklab_default(convertRgbToLrgb_default(rgb2));
    if (rgb2.r === rgb2.b && rgb2.b === rgb2.g) {
      res.a = res.b = 0;
    }
    return res;
  };
  var convertRgbToOklab_default = convertRgbToOklab;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/oklab/convertOklabToLrgb.js
  var convertOklabToLrgb = ({ l: l2, a: a2, b: b2, alpha }) => {
    if (l2 === void 0) l2 = 0;
    if (a2 === void 0) a2 = 0;
    if (b2 === void 0) b2 = 0;
    let L2 = Math.pow(l2 + 0.3963377773761749 * a2 + 0.2158037573099136 * b2, 3);
    let M4 = Math.pow(l2 - 0.1055613458156586 * a2 - 0.0638541728258133 * b2, 3);
    let S2 = Math.pow(l2 - 0.0894841775298119 * a2 - 1.2914855480194092 * b2, 3);
    let res = {
      mode: "lrgb",
      r: 4.076741636075957 * L2 - 3.3077115392580616 * M4 + 0.2309699031821044 * S2,
      g: -1.2684379732850317 * L2 + 2.6097573492876887 * M4 - 0.3413193760026573 * S2,
      b: -0.0041960761386756 * L2 - 0.7034186179359362 * M4 + 1.7076146940746117 * S2
    };
    if (alpha !== void 0) {
      res.alpha = alpha;
    }
    return res;
  };
  var convertOklabToLrgb_default = convertOklabToLrgb;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/oklab/convertOklabToRgb.js
  var convertOklabToRgb = (c3) => convertLrgbToRgb_default(convertOklabToLrgb_default(c3));
  var convertOklabToRgb_default = convertOklabToRgb;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/okhsl/helpers.js
  function toe(x2) {
    const k_1 = 0.206;
    const k_2 = 0.03;
    const k_3 = (1 + k_1) / (1 + k_2);
    return 0.5 * (k_3 * x2 - k_1 + Math.sqrt((k_3 * x2 - k_1) * (k_3 * x2 - k_1) + 4 * k_2 * k_3 * x2));
  }
  function toe_inv(x2) {
    const k_1 = 0.206;
    const k_2 = 0.03;
    const k_3 = (1 + k_1) / (1 + k_2);
    return (x2 * x2 + k_1 * x2) / (k_3 * (x2 + k_2));
  }
  function compute_max_saturation(a2, b2) {
    let k0, k1, k22, k32, k42, wl, wm, ws;
    if (-1.88170328 * a2 - 0.80936493 * b2 > 1) {
      k0 = 1.19086277;
      k1 = 1.76576728;
      k22 = 0.59662641;
      k32 = 0.75515197;
      k42 = 0.56771245;
      wl = 4.0767416621;
      wm = -3.3077115913;
      ws = 0.2309699292;
    } else if (1.81444104 * a2 - 1.19445276 * b2 > 1) {
      k0 = 0.73956515;
      k1 = -0.45954404;
      k22 = 0.08285427;
      k32 = 0.1254107;
      k42 = 0.14503204;
      wl = -1.2684380046;
      wm = 2.6097574011;
      ws = -0.3413193965;
    } else {
      k0 = 1.35733652;
      k1 = -915799e-8;
      k22 = -1.1513021;
      k32 = -0.50559606;
      k42 = 692167e-8;
      wl = -0.0041960863;
      wm = -0.7034186147;
      ws = 1.707614701;
    }
    let S2 = k0 + k1 * a2 + k22 * b2 + k32 * a2 * a2 + k42 * a2 * b2;
    let k_l = 0.3963377774 * a2 + 0.2158037573 * b2;
    let k_m = -0.1055613458 * a2 - 0.0638541728 * b2;
    let k_s = -0.0894841775 * a2 - 1.291485548 * b2;
    {
      let l_ = 1 + S2 * k_l;
      let m_ = 1 + S2 * k_m;
      let s_ = 1 + S2 * k_s;
      let l2 = l_ * l_ * l_;
      let m2 = m_ * m_ * m_;
      let s = s_ * s_ * s_;
      let l_dS = 3 * k_l * l_ * l_;
      let m_dS = 3 * k_m * m_ * m_;
      let s_dS = 3 * k_s * s_ * s_;
      let l_dS2 = 6 * k_l * k_l * l_;
      let m_dS2 = 6 * k_m * k_m * m_;
      let s_dS2 = 6 * k_s * k_s * s_;
      let f4 = wl * l2 + wm * m2 + ws * s;
      let f1 = wl * l_dS + wm * m_dS + ws * s_dS;
      let f22 = wl * l_dS2 + wm * m_dS2 + ws * s_dS2;
      S2 = S2 - f4 * f1 / (f1 * f1 - 0.5 * f4 * f22);
    }
    return S2;
  }
  function find_cusp(a2, b2) {
    let S_cusp = compute_max_saturation(a2, b2);
    let rgb2 = convertOklabToLrgb_default({ l: 1, a: S_cusp * a2, b: S_cusp * b2 });
    let L_cusp = Math.cbrt(1 / Math.max(rgb2.r, rgb2.g, rgb2.b));
    let C_cusp = L_cusp * S_cusp;
    return [L_cusp, C_cusp];
  }
  function find_gamut_intersection(a2, b2, L1, C12, L0, cusp = null) {
    if (!cusp) {
      cusp = find_cusp(a2, b2);
    }
    let t;
    if ((L1 - L0) * cusp[1] - (cusp[0] - L0) * C12 <= 0) {
      t = cusp[1] * L0 / (C12 * cusp[0] + cusp[1] * (L0 - L1));
    } else {
      t = cusp[1] * (L0 - 1) / (C12 * (cusp[0] - 1) + cusp[1] * (L0 - L1));
      {
        let dL = L1 - L0;
        let dC = C12;
        let k_l = 0.3963377774 * a2 + 0.2158037573 * b2;
        let k_m = -0.1055613458 * a2 - 0.0638541728 * b2;
        let k_s = -0.0894841775 * a2 - 1.291485548 * b2;
        let l_dt = dL + dC * k_l;
        let m_dt = dL + dC * k_m;
        let s_dt = dL + dC * k_s;
        {
          let L2 = L0 * (1 - t) + t * L1;
          let C4 = t * C12;
          let l_ = L2 + C4 * k_l;
          let m_ = L2 + C4 * k_m;
          let s_ = L2 + C4 * k_s;
          let l2 = l_ * l_ * l_;
          let m2 = m_ * m_ * m_;
          let s = s_ * s_ * s_;
          let ldt = 3 * l_dt * l_ * l_;
          let mdt = 3 * m_dt * m_ * m_;
          let sdt = 3 * s_dt * s_ * s_;
          let ldt2 = 6 * l_dt * l_dt * l_;
          let mdt2 = 6 * m_dt * m_dt * m_;
          let sdt2 = 6 * s_dt * s_dt * s_;
          let r = 4.0767416621 * l2 - 3.3077115913 * m2 + 0.2309699292 * s - 1;
          let r1 = 4.0767416621 * ldt - 3.3077115913 * mdt + 0.2309699292 * sdt;
          let r2 = 4.0767416621 * ldt2 - 3.3077115913 * mdt2 + 0.2309699292 * sdt2;
          let u_r = r1 / (r1 * r1 - 0.5 * r * r2);
          let t_r = -r * u_r;
          let g2 = -1.2684380046 * l2 + 2.6097574011 * m2 - 0.3413193965 * s - 1;
          let g1 = -1.2684380046 * ldt + 2.6097574011 * mdt - 0.3413193965 * sdt;
          let g22 = -1.2684380046 * ldt2 + 2.6097574011 * mdt2 - 0.3413193965 * sdt2;
          let u_g = g1 / (g1 * g1 - 0.5 * g2 * g22);
          let t_g = -g2 * u_g;
          let b3 = -0.0041960863 * l2 - 0.7034186147 * m2 + 1.707614701 * s - 1;
          let b1 = -0.0041960863 * ldt - 0.7034186147 * mdt + 1.707614701 * sdt;
          let b22 = -0.0041960863 * ldt2 - 0.7034186147 * mdt2 + 1.707614701 * sdt2;
          let u_b = b1 / (b1 * b1 - 0.5 * b3 * b22);
          let t_b = -b3 * u_b;
          t_r = u_r >= 0 ? t_r : 1e6;
          t_g = u_g >= 0 ? t_g : 1e6;
          t_b = u_b >= 0 ? t_b : 1e6;
          t += Math.min(t_r, Math.min(t_g, t_b));
        }
      }
    }
    return t;
  }
  function get_ST_max(a_, b_, cusp = null) {
    if (!cusp) {
      cusp = find_cusp(a_, b_);
    }
    let L2 = cusp[0];
    let C4 = cusp[1];
    return [C4 / L2, C4 / (1 - L2)];
  }
  function get_Cs(L2, a_, b_) {
    let cusp = find_cusp(a_, b_);
    let C_max = find_gamut_intersection(a_, b_, L2, 1, L2, cusp);
    let ST_max = get_ST_max(a_, b_, cusp);
    let S_mid = 0.11516993 + 1 / (7.4477897 + 4.1590124 * b_ + a_ * (-2.19557347 + 1.75198401 * b_ + a_ * (-2.13704948 - 10.02301043 * b_ + a_ * (-4.24894561 + 5.38770819 * b_ + 4.69891013 * a_))));
    let T_mid = 0.11239642 + 1 / (1.6132032 - 0.68124379 * b_ + a_ * (0.40370612 + 0.90148123 * b_ + a_ * (-0.27087943 + 0.6122399 * b_ + a_ * (299215e-8 - 0.45399568 * b_ - 0.14661872 * a_))));
    let k5 = C_max / Math.min(L2 * ST_max[0], (1 - L2) * ST_max[1]);
    let C_a = L2 * S_mid;
    let C_b = (1 - L2) * T_mid;
    let C_mid = 0.9 * k5 * Math.sqrt(
      Math.sqrt(
        1 / (1 / (C_a * C_a * C_a * C_a) + 1 / (C_b * C_b * C_b * C_b))
      )
    );
    C_a = L2 * 0.4;
    C_b = (1 - L2) * 0.8;
    let C_0 = Math.sqrt(1 / (1 / (C_a * C_a) + 1 / (C_b * C_b)));
    return [C_0, C_mid, C_max];
  }

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/okhsl/convertOklabToOkhsl.js
  function convertOklabToOkhsl(lab2) {
    const l2 = lab2.l !== void 0 ? lab2.l : 0;
    const a2 = lab2.a !== void 0 ? lab2.a : 0;
    const b2 = lab2.b !== void 0 ? lab2.b : 0;
    const ret = { mode: "okhsl", l: toe(l2) };
    if (lab2.alpha !== void 0) {
      ret.alpha = lab2.alpha;
    }
    let c3 = Math.sqrt(a2 * a2 + b2 * b2);
    if (!c3) {
      ret.s = 0;
      return ret;
    }
    let [C_0, C_mid, C_max] = get_Cs(l2, a2 / c3, b2 / c3);
    let s;
    if (c3 < C_mid) {
      let k_0 = 0;
      let k_1 = 0.8 * C_0;
      let k_2 = 1 - k_1 / C_mid;
      let t = (c3 - k_0) / (k_1 + k_2 * (c3 - k_0));
      s = t * 0.8;
    } else {
      let k_0 = C_mid;
      let k_1 = 0.2 * C_mid * C_mid * 1.25 * 1.25 / C_0;
      let k_2 = 1 - k_1 / (C_max - C_mid);
      let t = (c3 - k_0) / (k_1 + k_2 * (c3 - k_0));
      s = 0.8 + 0.2 * t;
    }
    if (s) {
      ret.s = s;
      ret.h = normalizeHue_default(Math.atan2(b2, a2) * 180 / Math.PI);
    }
    return ret;
  }

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/okhsl/convertOkhslToOklab.js
  function convertOkhslToOklab(hsl2) {
    let h2 = hsl2.h !== void 0 ? hsl2.h : 0;
    let s = hsl2.s !== void 0 ? hsl2.s : 0;
    let l2 = hsl2.l !== void 0 ? hsl2.l : 0;
    const ret = { mode: "oklab", l: toe_inv(l2) };
    if (hsl2.alpha !== void 0) {
      ret.alpha = hsl2.alpha;
    }
    if (!s || l2 === 1) {
      ret.a = ret.b = 0;
      return ret;
    }
    let a_ = Math.cos(h2 / 180 * Math.PI);
    let b_ = Math.sin(h2 / 180 * Math.PI);
    let [C_0, C_mid, C_max] = get_Cs(ret.l, a_, b_);
    let t, k_0, k_1, k_2;
    if (s < 0.8) {
      t = 1.25 * s;
      k_0 = 0;
      k_1 = 0.8 * C_0;
      k_2 = 1 - k_1 / C_mid;
    } else {
      t = 5 * (s - 0.8);
      k_0 = C_mid;
      k_1 = 0.2 * C_mid * C_mid * 1.25 * 1.25 / C_0;
      k_2 = 1 - k_1 / (C_max - C_mid);
    }
    let C4 = k_0 + t * k_1 / (1 - k_2 * t);
    ret.a = C4 * a_;
    ret.b = C4 * b_;
    return ret;
  }

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/okhsl/modeOkhsl.js
  var modeOkhsl = __spreadProps(__spreadValues({}, definition_default7), {
    mode: "okhsl",
    channels: ["h", "s", "l", "alpha"],
    parse: ["--okhsl"],
    serialize: "--okhsl",
    fromMode: {
      oklab: convertOklabToOkhsl,
      rgb: (c3) => convertOklabToOkhsl(convertRgbToOklab_default(c3))
    },
    toMode: {
      oklab: convertOkhslToOklab,
      rgb: (c3) => convertOklabToRgb_default(convertOkhslToOklab(c3))
    }
  });
  var modeOkhsl_default = modeOkhsl;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/okhsv/convertOklabToOkhsv.js
  function convertOklabToOkhsv(lab2) {
    let l2 = lab2.l !== void 0 ? lab2.l : 0;
    let a2 = lab2.a !== void 0 ? lab2.a : 0;
    let b2 = lab2.b !== void 0 ? lab2.b : 0;
    let c3 = Math.sqrt(a2 * a2 + b2 * b2);
    let a_ = c3 ? a2 / c3 : 1;
    let b_ = c3 ? b2 / c3 : 1;
    let [S_max, T2] = get_ST_max(a_, b_);
    let S_0 = 0.5;
    let k5 = 1 - S_0 / S_max;
    let t = T2 / (c3 + l2 * T2);
    let L_v = t * l2;
    let C_v = t * c3;
    let L_vt = toe_inv(L_v);
    let C_vt = C_v * L_vt / L_v;
    let rgb_scale = convertOklabToLrgb_default({ l: L_vt, a: a_ * C_vt, b: b_ * C_vt });
    let scale_L = Math.cbrt(
      1 / Math.max(rgb_scale.r, rgb_scale.g, rgb_scale.b, 0)
    );
    l2 = l2 / scale_L;
    c3 = c3 / scale_L * toe(l2) / l2;
    l2 = toe(l2);
    const ret = {
      mode: "okhsv",
      s: c3 ? (S_0 + T2) * C_v / (T2 * S_0 + T2 * k5 * C_v) : 0,
      v: l2 ? l2 / L_v : 0
    };
    if (ret.s) {
      ret.h = normalizeHue_default(Math.atan2(b2, a2) * 180 / Math.PI);
    }
    if (lab2.alpha !== void 0) {
      ret.alpha = lab2.alpha;
    }
    return ret;
  }

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/okhsv/convertOkhsvToOklab.js
  function convertOkhsvToOklab(hsv2) {
    const ret = { mode: "oklab" };
    if (hsv2.alpha !== void 0) {
      ret.alpha = hsv2.alpha;
    }
    const h2 = hsv2.h !== void 0 ? hsv2.h : 0;
    const s = hsv2.s !== void 0 ? hsv2.s : 0;
    const v2 = hsv2.v !== void 0 ? hsv2.v : 0;
    const a_ = Math.cos(h2 / 180 * Math.PI);
    const b_ = Math.sin(h2 / 180 * Math.PI);
    const [S_max, T2] = get_ST_max(a_, b_);
    const S_0 = 0.5;
    const k5 = 1 - S_0 / S_max;
    const L_v = 1 - s * S_0 / (S_0 + T2 - T2 * k5 * s);
    const C_v = s * T2 * S_0 / (S_0 + T2 - T2 * k5 * s);
    const L_vt = toe_inv(L_v);
    const C_vt = C_v * L_vt / L_v;
    const rgb_scale = convertOklabToLrgb_default({
      l: L_vt,
      a: a_ * C_vt,
      b: b_ * C_vt
    });
    const scale_L = Math.cbrt(
      1 / Math.max(rgb_scale.r, rgb_scale.g, rgb_scale.b, 0)
    );
    const L_new = toe_inv(v2 * L_v);
    const C4 = C_v * L_new / L_v;
    ret.l = L_new * scale_L;
    ret.a = C4 * a_ * scale_L;
    ret.b = C4 * b_ * scale_L;
    return ret;
  }

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/okhsv/modeOkhsv.js
  var modeOkhsv = __spreadProps(__spreadValues({}, definition_default8), {
    mode: "okhsv",
    channels: ["h", "s", "v", "alpha"],
    parse: ["--okhsv"],
    serialize: "--okhsv",
    fromMode: {
      oklab: convertOklabToOkhsv,
      rgb: (c3) => convertOklabToOkhsv(convertRgbToOklab_default(c3))
    },
    toMode: {
      oklab: convertOkhsvToOklab,
      rgb: (c3) => convertOklabToRgb_default(convertOkhsvToOklab(c3))
    }
  });
  var modeOkhsv_default = modeOkhsv;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/oklab/parseOklab.js
  function parseOklab(color, parsed) {
    if (!parsed || parsed[0] !== "oklab") {
      return void 0;
    }
    const res = { mode: "oklab" };
    const [, l2, a2, b2, alpha] = parsed;
    if (l2.type === Tok.Hue || a2.type === Tok.Hue || b2.type === Tok.Hue) {
      return void 0;
    }
    if (l2.type !== Tok.None) {
      res.l = Math.min(
        Math.max(0, l2.type === Tok.Number ? l2.value : l2.value / 100),
        1
      );
    }
    if (a2.type !== Tok.None) {
      res.a = a2.type === Tok.Number ? a2.value : a2.value * 0.4 / 100;
    }
    if (b2.type !== Tok.None) {
      res.b = b2.type === Tok.Number ? b2.value : b2.value * 0.4 / 100;
    }
    if (alpha.type !== Tok.None) {
      res.alpha = Math.min(
        1,
        Math.max(
          0,
          alpha.type === Tok.Number ? alpha.value : alpha.value / 100
        )
      );
    }
    return res;
  }
  var parseOklab_default = parseOklab;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/oklab/definition.js
  var definition20 = __spreadProps(__spreadValues({}, definition_default13), {
    mode: "oklab",
    toMode: {
      lrgb: convertOklabToLrgb_default,
      rgb: convertOklabToRgb_default
    },
    fromMode: {
      lrgb: convertLrgbToOklab_default,
      rgb: convertRgbToOklab_default
    },
    ranges: {
      l: [0, 1],
      a: [-0.4, 0.4],
      b: [-0.4, 0.4]
    },
    parse: [parseOklab_default],
    serialize: (c3) => `oklab(${c3.l !== void 0 ? c3.l : "none"} ${c3.a !== void 0 ? c3.a : "none"} ${c3.b !== void 0 ? c3.b : "none"}${c3.alpha < 1 ? ` / ${c3.alpha}` : ""})`
  });
  var definition_default20 = definition20;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/oklch/parseOklch.js
  function parseOklch(color, parsed) {
    if (!parsed || parsed[0] !== "oklch") {
      return void 0;
    }
    const res = { mode: "oklch" };
    const [, l2, c3, h2, alpha] = parsed;
    if (l2.type !== Tok.None) {
      if (l2.type === Tok.Hue) {
        return void 0;
      }
      res.l = Math.min(
        Math.max(0, l2.type === Tok.Number ? l2.value : l2.value / 100),
        1
      );
    }
    if (c3.type !== Tok.None) {
      res.c = Math.max(
        0,
        c3.type === Tok.Number ? c3.value : c3.value * 0.4 / 100
      );
    }
    if (h2.type !== Tok.None) {
      if (h2.type === Tok.Percentage) {
        return void 0;
      }
      res.h = h2.value;
    }
    if (alpha.type !== Tok.None) {
      res.alpha = Math.min(
        1,
        Math.max(
          0,
          alpha.type === Tok.Number ? alpha.value : alpha.value / 100
        )
      );
    }
    return res;
  }
  var parseOklch_default = parseOklch;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/oklch/definition.js
  var definition21 = __spreadProps(__spreadValues({}, definition_default15), {
    mode: "oklch",
    toMode: {
      oklab: (c3) => convertLchToLab_default(c3, "oklab"),
      rgb: (c3) => convertOklabToRgb_default(convertLchToLab_default(c3, "oklab"))
    },
    fromMode: {
      rgb: (c3) => convertLabToLch_default(convertRgbToOklab_default(c3), "oklch"),
      oklab: (c3) => convertLabToLch_default(c3, "oklch")
    },
    parse: [parseOklch_default],
    serialize: (c3) => `oklch(${c3.l !== void 0 ? c3.l : "none"} ${c3.c !== void 0 ? c3.c : "none"} ${c3.h !== void 0 ? c3.h : "none"}${c3.alpha < 1 ? ` / ${c3.alpha}` : ""})`,
    ranges: {
      l: [0, 1],
      c: [0, 0.4],
      h: [0, 360]
    }
  });
  var definition_default21 = definition21;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/p3/convertP3ToXyz65.js
  var convertP3ToXyz65 = (rgb2) => {
    let { r, g: g2, b: b2, alpha } = convertRgbToLrgb_default(rgb2);
    let res = {
      mode: "xyz65",
      x: 0.486570948648216 * r + 0.265667693169093 * g2 + 0.1982172852343625 * b2,
      y: 0.2289745640697487 * r + 0.6917385218365062 * g2 + 0.079286914093745 * b2,
      z: 0 * r + 0.0451133818589026 * g2 + 1.043944368900976 * b2
    };
    if (alpha !== void 0) {
      res.alpha = alpha;
    }
    return res;
  };
  var convertP3ToXyz65_default = convertP3ToXyz65;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/p3/convertXyz65ToP3.js
  var convertXyz65ToP3 = ({ x: x2, y: y2, z, alpha }) => {
    if (x2 === void 0) x2 = 0;
    if (y2 === void 0) y2 = 0;
    if (z === void 0) z = 0;
    let res = convertLrgbToRgb_default(
      {
        r: x2 * 2.4934969119414263 - y2 * 0.9313836179191242 - 0.402710784450717 * z,
        g: x2 * -0.8294889695615749 + y2 * 1.7626640603183465 + 0.0236246858419436 * z,
        b: x2 * 0.0358458302437845 - y2 * 0.0761723892680418 + 0.9568845240076871 * z
      },
      "p3"
    );
    if (alpha !== void 0) {
      res.alpha = alpha;
    }
    return res;
  };
  var convertXyz65ToP3_default = convertXyz65ToP3;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/p3/definition.js
  var definition22 = __spreadProps(__spreadValues({}, definition_default), {
    mode: "p3",
    parse: ["display-p3"],
    serialize: "display-p3",
    fromMode: {
      rgb: (color) => convertXyz65ToP3_default(convertRgbToXyz65_default(color)),
      xyz65: convertXyz65ToP3_default
    },
    toMode: {
      rgb: (color) => convertXyz65ToRgb_default(convertP3ToXyz65_default(color)),
      xyz65: convertP3ToXyz65_default
    }
  });
  var definition_default22 = definition22;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/prophoto/convertXyz50ToProphoto.js
  var gamma2 = (v2) => {
    let abs2 = Math.abs(v2);
    if (abs2 >= 1 / 512) {
      return Math.sign(v2) * Math.pow(abs2, 1 / 1.8);
    }
    return 16 * v2;
  };
  var convertXyz50ToProphoto = ({ x: x2, y: y2, z, alpha }) => {
    if (x2 === void 0) x2 = 0;
    if (y2 === void 0) y2 = 0;
    if (z === void 0) z = 0;
    let res = {
      mode: "prophoto",
      r: gamma2(
        x2 * 1.3457868816471585 - y2 * 0.2555720873797946 - 0.0511018649755453 * z
      ),
      g: gamma2(
        x2 * -0.5446307051249019 + y2 * 1.5082477428451466 + 0.0205274474364214 * z
      ),
      b: gamma2(x2 * 0 + y2 * 0 + 1.2119675456389452 * z)
    };
    if (alpha !== void 0) {
      res.alpha = alpha;
    }
    return res;
  };
  var convertXyz50ToProphoto_default = convertXyz50ToProphoto;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/prophoto/convertProphotoToXyz50.js
  var linearize2 = (v2 = 0) => {
    let abs2 = Math.abs(v2);
    if (abs2 >= 16 / 512) {
      return Math.sign(v2) * Math.pow(abs2, 1.8);
    }
    return v2 / 16;
  };
  var convertProphotoToXyz50 = (prophoto2) => {
    let r = linearize2(prophoto2.r);
    let g2 = linearize2(prophoto2.g);
    let b2 = linearize2(prophoto2.b);
    let res = {
      mode: "xyz50",
      x: 0.7977666449006423 * r + 0.1351812974005331 * g2 + 0.0313477341283922 * b2,
      y: 0.2880748288194013 * r + 0.7118352342418731 * g2 + 899369387256e-16 * b2,
      z: 0 * r + 0 * g2 + 0.8251046025104602 * b2
    };
    if (prophoto2.alpha !== void 0) {
      res.alpha = prophoto2.alpha;
    }
    return res;
  };
  var convertProphotoToXyz50_default = convertProphotoToXyz50;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/prophoto/definition.js
  var definition23 = __spreadProps(__spreadValues({}, definition_default), {
    mode: "prophoto",
    parse: ["prophoto-rgb"],
    serialize: "prophoto-rgb",
    fromMode: {
      xyz50: convertXyz50ToProphoto_default,
      rgb: (color) => convertXyz50ToProphoto_default(convertRgbToXyz50_default(color))
    },
    toMode: {
      xyz50: convertProphotoToXyz50_default,
      rgb: (color) => convertXyz50ToRgb_default(convertProphotoToXyz50_default(color))
    }
  });
  var definition_default23 = definition23;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/rec2020/convertXyz65ToRec2020.js
  var \u03B1 = 1.09929682680944;
  var \u03B2 = 0.018053968510807;
  var gamma3 = (v2) => {
    const abs2 = Math.abs(v2);
    if (abs2 > \u03B2) {
      return (Math.sign(v2) || 1) * (\u03B1 * Math.pow(abs2, 0.45) - (\u03B1 - 1));
    }
    return 4.5 * v2;
  };
  var convertXyz65ToRec2020 = ({ x: x2, y: y2, z, alpha }) => {
    if (x2 === void 0) x2 = 0;
    if (y2 === void 0) y2 = 0;
    if (z === void 0) z = 0;
    let res = {
      mode: "rec2020",
      r: gamma3(
        x2 * 1.7166511879712683 - y2 * 0.3556707837763925 - 0.2533662813736599 * z
      ),
      g: gamma3(
        x2 * -0.6666843518324893 + y2 * 1.6164812366349395 + 0.0157685458139111 * z
      ),
      b: gamma3(
        x2 * 0.0176398574453108 - y2 * 0.0427706132578085 + 0.9421031212354739 * z
      )
    };
    if (alpha !== void 0) {
      res.alpha = alpha;
    }
    return res;
  };
  var convertXyz65ToRec2020_default = convertXyz65ToRec2020;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/rec2020/convertRec2020ToXyz65.js
  var \u03B12 = 1.09929682680944;
  var \u03B22 = 0.018053968510807;
  var linearize3 = (v2 = 0) => {
    let abs2 = Math.abs(v2);
    if (abs2 < \u03B22 * 4.5) {
      return v2 / 4.5;
    }
    return (Math.sign(v2) || 1) * Math.pow((abs2 + \u03B12 - 1) / \u03B12, 1 / 0.45);
  };
  var convertRec2020ToXyz65 = (rec20202) => {
    let r = linearize3(rec20202.r);
    let g2 = linearize3(rec20202.g);
    let b2 = linearize3(rec20202.b);
    let res = {
      mode: "xyz65",
      x: 0.6369580483012911 * r + 0.1446169035862083 * g2 + 0.1688809751641721 * b2,
      y: 0.262700212011267 * r + 0.6779980715188708 * g2 + 0.059301716469862 * b2,
      z: 0 * r + 0.0280726930490874 * g2 + 1.0609850577107909 * b2
    };
    if (rec20202.alpha !== void 0) {
      res.alpha = rec20202.alpha;
    }
    return res;
  };
  var convertRec2020ToXyz65_default = convertRec2020ToXyz65;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/rec2020/definition.js
  var definition24 = __spreadProps(__spreadValues({}, definition_default), {
    mode: "rec2020",
    fromMode: {
      xyz65: convertXyz65ToRec2020_default,
      rgb: (color) => convertXyz65ToRec2020_default(convertRgbToXyz65_default(color))
    },
    toMode: {
      xyz65: convertRec2020ToXyz65_default,
      rgb: (color) => convertXyz65ToRgb_default(convertRec2020ToXyz65_default(color))
    },
    parse: ["rec2020"],
    serialize: "rec2020"
  });
  var definition_default24 = definition24;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/xyb/constants.js
  var bias = 0.0037930732552754493;
  var bias_cbrt = Math.cbrt(bias);

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/xyb/convertRgbToXyb.js
  var transfer = (v2) => Math.cbrt(v2) - bias_cbrt;
  var convertRgbToXyb = (color) => {
    const { r, g: g2, b: b2, alpha } = convertRgbToLrgb_default(color);
    const l2 = transfer(0.3 * r + 0.622 * g2 + 0.078 * b2 + bias);
    const m2 = transfer(0.23 * r + 0.692 * g2 + 0.078 * b2 + bias);
    const s = transfer(
      0.2434226892454782 * r + 0.2047674442449682 * g2 + 0.5518098665095535 * b2 + bias
    );
    const res = {
      mode: "xyb",
      x: (l2 - m2) / 2,
      y: (l2 + m2) / 2,
      /* Apply default chroma from luma (subtract Y from B) */
      b: s - (l2 + m2) / 2
    };
    if (alpha !== void 0) res.alpha = alpha;
    return res;
  };
  var convertRgbToXyb_default = convertRgbToXyb;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/xyb/convertXybToRgb.js
  var transfer2 = (v2) => Math.pow(v2 + bias_cbrt, 3);
  var convertXybToRgb = ({ x: x2, y: y2, b: b2, alpha }) => {
    if (x2 === void 0) x2 = 0;
    if (y2 === void 0) y2 = 0;
    if (b2 === void 0) b2 = 0;
    const l2 = transfer2(x2 + y2) - bias;
    const m2 = transfer2(y2 - x2) - bias;
    const s = transfer2(b2 + y2) - bias;
    const res = convertLrgbToRgb_default({
      r: 11.031566904639861 * l2 - 9.866943908131562 * m2 - 0.16462299650829934 * s,
      g: -3.2541473810744237 * l2 + 4.418770377582723 * m2 - 0.16462299650829934 * s,
      b: -3.6588512867136815 * l2 + 2.7129230459360922 * m2 + 1.9459282407775895 * s
    });
    if (alpha !== void 0) res.alpha = alpha;
    return res;
  };
  var convertXybToRgb_default = convertXybToRgb;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/xyb/definition.js
  var definition25 = {
    mode: "xyb",
    channels: ["x", "y", "b", "alpha"],
    parse: ["--xyb"],
    serialize: "--xyb",
    toMode: {
      rgb: convertXybToRgb_default
    },
    fromMode: {
      rgb: convertRgbToXyb_default
    },
    ranges: {
      x: [-0.0154, 0.0281],
      y: [0, 0.8453],
      b: [-0.2778, 0.388]
    },
    interpolate: {
      x: interpolatorLinear,
      y: interpolatorLinear,
      b: interpolatorLinear,
      alpha: { use: interpolatorLinear, fixup: fixupAlpha }
    }
  };
  var definition_default25 = definition25;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/xyz50/definition.js
  var definition26 = {
    mode: "xyz50",
    parse: ["xyz-d50"],
    serialize: "xyz-d50",
    toMode: {
      rgb: convertXyz50ToRgb_default,
      lab: convertXyz50ToLab_default
    },
    fromMode: {
      rgb: convertRgbToXyz50_default,
      lab: convertLabToXyz50_default
    },
    channels: ["x", "y", "z", "alpha"],
    ranges: {
      x: [0, 0.964],
      y: [0, 0.999],
      z: [0, 0.825]
    },
    interpolate: {
      x: interpolatorLinear,
      y: interpolatorLinear,
      z: interpolatorLinear,
      alpha: { use: interpolatorLinear, fixup: fixupAlpha }
    }
  };
  var definition_default26 = definition26;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/xyz65/convertXyz65ToXyz50.js
  var convertXyz65ToXyz50 = (xyz652) => {
    let { x: x2, y: y2, z, alpha } = xyz652;
    if (x2 === void 0) x2 = 0;
    if (y2 === void 0) y2 = 0;
    if (z === void 0) z = 0;
    let res = {
      mode: "xyz50",
      x: 1.0479298208405488 * x2 + 0.0229467933410191 * y2 - 0.0501922295431356 * z,
      y: 0.0296278156881593 * x2 + 0.990434484573249 * y2 - 0.0170738250293851 * z,
      z: -0.0092430581525912 * x2 + 0.0150551448965779 * y2 + 0.7518742899580008 * z
    };
    if (alpha !== void 0) {
      res.alpha = alpha;
    }
    return res;
  };
  var convertXyz65ToXyz50_default = convertXyz65ToXyz50;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/xyz65/convertXyz50ToXyz65.js
  var convertXyz50ToXyz65 = (xyz502) => {
    let { x: x2, y: y2, z, alpha } = xyz502;
    if (x2 === void 0) x2 = 0;
    if (y2 === void 0) y2 = 0;
    if (z === void 0) z = 0;
    let res = {
      mode: "xyz65",
      x: 0.9554734527042182 * x2 - 0.0230985368742614 * y2 + 0.0632593086610217 * z,
      y: -0.0283697069632081 * x2 + 1.0099954580058226 * y2 + 0.021041398966943 * z,
      z: 0.0123140016883199 * x2 - 0.0205076964334779 * y2 + 1.3303659366080753 * z
    };
    if (alpha !== void 0) {
      res.alpha = alpha;
    }
    return res;
  };
  var convertXyz50ToXyz65_default = convertXyz50ToXyz65;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/xyz65/definition.js
  var definition27 = {
    mode: "xyz65",
    toMode: {
      rgb: convertXyz65ToRgb_default,
      xyz50: convertXyz65ToXyz50_default
    },
    fromMode: {
      rgb: convertRgbToXyz65_default,
      xyz50: convertXyz50ToXyz65_default
    },
    ranges: {
      x: [0, 0.95],
      y: [0, 1],
      z: [0, 1.088]
    },
    channels: ["x", "y", "z", "alpha"],
    parse: ["xyz", "xyz-d65"],
    serialize: "xyz-d65",
    interpolate: {
      x: interpolatorLinear,
      y: interpolatorLinear,
      z: interpolatorLinear,
      alpha: { use: interpolatorLinear, fixup: fixupAlpha }
    }
  };
  var definition_default27 = definition27;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/yiq/convertRgbToYiq.js
  var convertRgbToYiq = ({ r, g: g2, b: b2, alpha }) => {
    if (r === void 0) r = 0;
    if (g2 === void 0) g2 = 0;
    if (b2 === void 0) b2 = 0;
    const res = {
      mode: "yiq",
      y: 0.29889531 * r + 0.58662247 * g2 + 0.11448223 * b2,
      i: 0.59597799 * r - 0.2741761 * g2 - 0.32180189 * b2,
      q: 0.21147017 * r - 0.52261711 * g2 + 0.31114694 * b2
    };
    if (alpha !== void 0) res.alpha = alpha;
    return res;
  };
  var convertRgbToYiq_default = convertRgbToYiq;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/yiq/convertYiqToRgb.js
  var convertYiqToRgb = ({ y: y2, i, q, alpha }) => {
    if (y2 === void 0) y2 = 0;
    if (i === void 0) i = 0;
    if (q === void 0) q = 0;
    const res = {
      mode: "rgb",
      r: y2 + 0.95608445 * i + 0.6208885 * q,
      g: y2 - 0.27137664 * i - 0.6486059 * q,
      b: y2 - 1.10561724 * i + 1.70250126 * q
    };
    if (alpha !== void 0) res.alpha = alpha;
    return res;
  };
  var convertYiqToRgb_default = convertYiqToRgb;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/yiq/definition.js
  var definition28 = {
    mode: "yiq",
    toMode: {
      rgb: convertYiqToRgb_default
    },
    fromMode: {
      rgb: convertRgbToYiq_default
    },
    channels: ["y", "i", "q", "alpha"],
    parse: ["--yiq"],
    serialize: "--yiq",
    ranges: {
      i: [-0.595, 0.595],
      q: [-0.522, 0.522]
    },
    interpolate: {
      y: interpolatorLinear,
      i: interpolatorLinear,
      q: interpolatorLinear,
      alpha: { use: interpolatorLinear, fixup: fixupAlpha }
    }
  };
  var definition_default28 = definition28;

  // ../../node_modules/.pnpm/culori@4.0.2/node_modules/culori/src/index.js
  var a98 = useMode(definition_default2);
  var cubehelix = useMode(definition_default3);
  var dlab = useMode(definition_default4);
  var dlch = useMode(definition_default5);
  var hsi = useMode(definition_default6);
  var hsl = useMode(definition_default7);
  var hsv = useMode(definition_default8);
  var hwb = useMode(definition_default9);
  var itp = useMode(definition_default10);
  var jab = useMode(definition_default11);
  var jch = useMode(definition_default12);
  var lab = useMode(definition_default13);
  var lab65 = useMode(definition_default14);
  var lch = useMode(definition_default15);
  var lch65 = useMode(definition_default16);
  var lchuv = useMode(definition_default17);
  var lrgb = useMode(definition_default18);
  var luv = useMode(definition_default19);
  var okhsl = useMode(modeOkhsl_default);
  var okhsv = useMode(modeOkhsv_default);
  var oklab = useMode(definition_default20);
  var oklch = useMode(definition_default21);
  var p3 = useMode(definition_default22);
  var prophoto = useMode(definition_default23);
  var rec2020 = useMode(definition_default24);
  var rgb = useMode(definition_default);
  var xyb = useMode(definition_default25);
  var xyz50 = useMode(definition_default26);
  var xyz65 = useMode(definition_default27);
  var yiq = useMode(definition_default28);

  // ../../packages/shadcn/dist/chunk-ILZM3WB2.js
  var b = ["nova", "vega", "maia", "lyra", "mira", "luma", "sera"];
  var R = ["neutral", "stone", "zinc", "gray", "mauve", "olive", "mist", "taupe"];
  var f3 = ["neutral", "stone", "zinc", "gray", "amber", "blue", "cyan", "emerald", "fuchsia", "green", "indigo", "lime", "orange", "pink", "purple", "red", "rose", "sky", "teal", "violet", "yellow", "mauve", "olive", "mist", "taupe"];
  var y = f3;
  var N = { neutral: "blue", stone: "lime", zinc: "amber", mauve: "emerald", olive: "violet", mist: "rose", taupe: "cyan" };
  var _ = ["lucide", "hugeicons", "tabler", "phosphor", "remixicon"];
  var c2 = ["inter", "noto-sans", "nunito-sans", "figtree", "roboto", "raleway", "dm-sans", "public-sans", "outfit", "jetbrains-mono", "geist", "geist-mono", "lora", "merriweather", "playfair-display", "noto-serif", "roboto-slab", "oxanium", "manrope", "space-grotesk", "montserrat", "ibm-plex-sans", "source-sans-3", "instrument-sans", "eb-garamond", "instrument-serif"];
  var g = ["inherit", ...c2];
  var d = ["default", "none", "small", "medium", "large"];
  var T = ["subtle", "bold"];
  var P = ["default", "inverted", "default-translucent", "inverted-translucent"];
  var E = [{ key: "menuColor", values: P, bits: 3 }, { key: "menuAccent", values: T, bits: 3 }, { key: "radius", values: d, bits: 4 }, { key: "font", values: c2, bits: 6 }, { key: "iconLibrary", values: _, bits: 6 }, { key: "theme", values: f3, bits: 6 }, { key: "baseColor", values: R, bits: 6 }, { key: "style", values: b, bits: 6 }];
  var a = [...E, { key: "chartColor", values: y, bits: 6 }, { key: "fontHeading", values: g, bits: 5 }];
  var C = Object.fromEntries(a.map((e4) => [e4.key, e4.values[0]]));
  var l = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  var x = "b";
  var S = ["a", "b"];
  function O(e4) {
    if (e4 === 0) return "0";
    let t = "", n = e4;
    for (; n > 0; ) t = l[n % 62] + t, n = Math.floor(n / 62);
    return t;
  }
  function h(e4) {
    let t = 0;
    for (let n = 0; n < e4.length; n++) {
      let s = l.indexOf(e4[n]);
      if (s === -1) return -1;
      t = t * 62 + s;
    }
    return t;
  }
  function m(e4) {
    let t = __spreadValues(__spreadValues({}, C), e4), n = 0, s = 0;
    for (let o of a) {
      let i = o.values.indexOf(t[o.key]);
      n += (i === -1 ? 0 : i) * 2 ** s, s += o.bits;
    }
    return x + O(n);
  }
  function p4(e4) {
    if (!e4 || e4.length < 2) return null;
    let t = e4[0];
    if (!S.includes(t)) return null;
    let n = t === "a" ? E : a, s = h(e4.slice(1));
    if (s < 0) return null;
    let o = {}, i = 0;
    for (let r of n) {
      let u = Math.floor(s / 2 ** i) % 2 ** r.bits;
      o[r.key] = u < r.values.length ? r.values[u] : r.values[0], i += r.bits;
    }
    return t === "a" && (o.fontHeading = "inherit"), o;
  }

  // ../v4/registry/themes.ts
  var THEMES = [
    {
      name: "neutral",
      title: "Neutral",
      type: "registry:theme",
      cssVars: {
        light: {
          background: "oklch(1 0 0)",
          foreground: "oklch(0.145 0 0)",
          card: "oklch(1 0 0)",
          "card-foreground": "oklch(0.145 0 0)",
          popover: "oklch(1 0 0)",
          "popover-foreground": "oklch(0.145 0 0)",
          primary: "oklch(0.205 0 0)",
          "primary-foreground": "oklch(0.985 0 0)",
          secondary: "oklch(0.97 0 0)",
          "secondary-foreground": "oklch(0.205 0 0)",
          muted: "oklch(0.97 0 0)",
          "muted-foreground": "oklch(0.556 0 0)",
          accent: "oklch(0.97 0 0)",
          "accent-foreground": "oklch(0.205 0 0)",
          destructive: "oklch(0.577 0.245 27.325)",
          border: "oklch(0.922 0 0)",
          input: "oklch(0.922 0 0)",
          ring: "oklch(0.708 0 0)",
          "chart-1": "oklch(0.87 0 0)",
          "chart-2": "oklch(0.556 0 0)",
          "chart-3": "oklch(0.439 0 0)",
          "chart-4": "oklch(0.371 0 0)",
          "chart-5": "oklch(0.269 0 0)",
          radius: "0.625rem",
          sidebar: "oklch(0.985 0 0)",
          "sidebar-foreground": "oklch(0.145 0 0)",
          "sidebar-primary": "oklch(0.205 0 0)",
          "sidebar-primary-foreground": "oklch(0.985 0 0)",
          "sidebar-accent": "oklch(0.97 0 0)",
          "sidebar-accent-foreground": "oklch(0.205 0 0)",
          "sidebar-border": "oklch(0.922 0 0)",
          "sidebar-ring": "oklch(0.708 0 0)"
        },
        dark: {
          background: "oklch(0.145 0 0)",
          foreground: "oklch(0.985 0 0)",
          card: "oklch(0.205 0 0)",
          "card-foreground": "oklch(0.985 0 0)",
          popover: "oklch(0.205 0 0)",
          "popover-foreground": "oklch(0.985 0 0)",
          primary: "oklch(0.922 0 0)",
          "primary-foreground": "oklch(0.205 0 0)",
          secondary: "oklch(0.269 0 0)",
          "secondary-foreground": "oklch(0.985 0 0)",
          muted: "oklch(0.269 0 0)",
          "muted-foreground": "oklch(0.708 0 0)",
          accent: "oklch(0.269 0 0)",
          "accent-foreground": "oklch(0.985 0 0)",
          destructive: "oklch(0.704 0.191 22.216)",
          border: "oklch(1 0 0 / 10%)",
          input: "oklch(1 0 0 / 15%)",
          ring: "oklch(0.556 0 0)",
          "chart-1": "oklch(0.87 0 0)",
          "chart-2": "oklch(0.556 0 0)",
          "chart-3": "oklch(0.439 0 0)",
          "chart-4": "oklch(0.371 0 0)",
          "chart-5": "oklch(0.269 0 0)",
          sidebar: "oklch(0.205 0 0)",
          "sidebar-foreground": "oklch(0.985 0 0)",
          "sidebar-primary": "oklch(0.488 0.243 264.376)",
          "sidebar-primary-foreground": "oklch(0.985 0 0)",
          "sidebar-accent": "oklch(0.269 0 0)",
          "sidebar-accent-foreground": "oklch(0.985 0 0)",
          "sidebar-border": "oklch(1 0 0 / 10%)",
          "sidebar-ring": "oklch(0.556 0 0)"
        }
      }
    },
    {
      name: "stone",
      title: "Stone",
      type: "registry:theme",
      cssVars: {
        light: {
          background: "oklch(1 0 0)",
          foreground: "oklch(0.147 0.004 49.25)",
          card: "oklch(1 0 0)",
          "card-foreground": "oklch(0.147 0.004 49.25)",
          popover: "oklch(1 0 0)",
          "popover-foreground": "oklch(0.147 0.004 49.25)",
          primary: "oklch(0.216 0.006 56.043)",
          "primary-foreground": "oklch(0.985 0.001 106.423)",
          secondary: "oklch(0.97 0.001 106.424)",
          "secondary-foreground": "oklch(0.216 0.006 56.043)",
          muted: "oklch(0.97 0.001 106.424)",
          "muted-foreground": "oklch(0.553 0.013 58.071)",
          accent: "oklch(0.97 0.001 106.424)",
          "accent-foreground": "oklch(0.216 0.006 56.043)",
          destructive: "oklch(0.577 0.245 27.325)",
          border: "oklch(0.923 0.003 48.717)",
          input: "oklch(0.923 0.003 48.717)",
          ring: "oklch(0.709 0.01 56.259)",
          "chart-1": "oklch(0.869 0.005 56.366)",
          "chart-2": "oklch(0.553 0.013 58.071)",
          "chart-3": "oklch(0.444 0.011 73.639)",
          "chart-4": "oklch(0.374 0.01 67.558)",
          "chart-5": "oklch(0.268 0.007 34.298)",
          radius: "0.625rem",
          sidebar: "oklch(0.985 0.001 106.423)",
          "sidebar-foreground": "oklch(0.147 0.004 49.25)",
          "sidebar-primary": "oklch(0.216 0.006 56.043)",
          "sidebar-primary-foreground": "oklch(0.985 0.001 106.423)",
          "sidebar-accent": "oklch(0.97 0.001 106.424)",
          "sidebar-accent-foreground": "oklch(0.216 0.006 56.043)",
          "sidebar-border": "oklch(0.923 0.003 48.717)",
          "sidebar-ring": "oklch(0.709 0.01 56.259)"
        },
        dark: {
          background: "oklch(0.147 0.004 49.25)",
          foreground: "oklch(0.985 0.001 106.423)",
          card: "oklch(0.216 0.006 56.043)",
          "card-foreground": "oklch(0.985 0.001 106.423)",
          popover: "oklch(0.216 0.006 56.043)",
          "popover-foreground": "oklch(0.985 0.001 106.423)",
          primary: "oklch(0.923 0.003 48.717)",
          "primary-foreground": "oklch(0.216 0.006 56.043)",
          secondary: "oklch(0.268 0.007 34.298)",
          "secondary-foreground": "oklch(0.985 0.001 106.423)",
          muted: "oklch(0.268 0.007 34.298)",
          "muted-foreground": "oklch(0.709 0.01 56.259)",
          accent: "oklch(0.268 0.007 34.298)",
          "accent-foreground": "oklch(0.985 0.001 106.423)",
          destructive: "oklch(0.704 0.191 22.216)",
          border: "oklch(1 0 0 / 10%)",
          input: "oklch(1 0 0 / 15%)",
          ring: "oklch(0.553 0.013 58.071)",
          "chart-1": "oklch(0.869 0.005 56.366)",
          "chart-2": "oklch(0.553 0.013 58.071)",
          "chart-3": "oklch(0.444 0.011 73.639)",
          "chart-4": "oklch(0.374 0.01 67.558)",
          "chart-5": "oklch(0.268 0.007 34.298)",
          sidebar: "oklch(0.216 0.006 56.043)",
          "sidebar-foreground": "oklch(0.985 0.001 106.423)",
          "sidebar-primary": "oklch(0.488 0.243 264.376)",
          "sidebar-primary-foreground": "oklch(0.985 0.001 106.423)",
          "sidebar-accent": "oklch(0.268 0.007 34.298)",
          "sidebar-accent-foreground": "oklch(0.985 0.001 106.423)",
          "sidebar-border": "oklch(1 0 0 / 10%)",
          "sidebar-ring": "oklch(0.553 0.013 58.071)"
        }
      }
    },
    {
      name: "zinc",
      title: "Zinc",
      type: "registry:theme",
      cssVars: {
        light: {
          background: "oklch(1 0 0)",
          foreground: "oklch(0.141 0.005 285.823)",
          card: "oklch(1 0 0)",
          "card-foreground": "oklch(0.141 0.005 285.823)",
          popover: "oklch(1 0 0)",
          "popover-foreground": "oklch(0.141 0.005 285.823)",
          primary: "oklch(0.21 0.006 285.885)",
          "primary-foreground": "oklch(0.985 0 0)",
          secondary: "oklch(0.967 0.001 286.375)",
          "secondary-foreground": "oklch(0.21 0.006 285.885)",
          muted: "oklch(0.967 0.001 286.375)",
          "muted-foreground": "oklch(0.552 0.016 285.938)",
          accent: "oklch(0.967 0.001 286.375)",
          "accent-foreground": "oklch(0.21 0.006 285.885)",
          destructive: "oklch(0.577 0.245 27.325)",
          border: "oklch(0.92 0.004 286.32)",
          input: "oklch(0.92 0.004 286.32)",
          ring: "oklch(0.705 0.015 286.067)",
          "chart-1": "oklch(0.871 0.006 286.286)",
          "chart-2": "oklch(0.552 0.016 285.938)",
          "chart-3": "oklch(0.442 0.017 285.786)",
          "chart-4": "oklch(0.37 0.013 285.805)",
          "chart-5": "oklch(0.274 0.006 286.033)",
          radius: "0.625rem",
          sidebar: "oklch(0.985 0 0)",
          "sidebar-foreground": "oklch(0.141 0.005 285.823)",
          "sidebar-primary": "oklch(0.21 0.006 285.885)",
          "sidebar-primary-foreground": "oklch(0.985 0 0)",
          "sidebar-accent": "oklch(0.967 0.001 286.375)",
          "sidebar-accent-foreground": "oklch(0.21 0.006 285.885)",
          "sidebar-border": "oklch(0.92 0.004 286.32)",
          "sidebar-ring": "oklch(0.705 0.015 286.067)"
        },
        dark: {
          background: "oklch(0.141 0.005 285.823)",
          foreground: "oklch(0.985 0 0)",
          card: "oklch(0.21 0.006 285.885)",
          "card-foreground": "oklch(0.985 0 0)",
          popover: "oklch(0.21 0.006 285.885)",
          "popover-foreground": "oklch(0.985 0 0)",
          primary: "oklch(0.92 0.004 286.32)",
          "primary-foreground": "oklch(0.21 0.006 285.885)",
          secondary: "oklch(0.274 0.006 286.033)",
          "secondary-foreground": "oklch(0.985 0 0)",
          muted: "oklch(0.274 0.006 286.033)",
          "muted-foreground": "oklch(0.705 0.015 286.067)",
          accent: "oklch(0.274 0.006 286.033)",
          "accent-foreground": "oklch(0.985 0 0)",
          destructive: "oklch(0.704 0.191 22.216)",
          border: "oklch(1 0 0 / 10%)",
          input: "oklch(1 0 0 / 15%)",
          ring: "oklch(0.552 0.016 285.938)",
          "chart-1": "oklch(0.871 0.006 286.286)",
          "chart-2": "oklch(0.552 0.016 285.938)",
          "chart-3": "oklch(0.442 0.017 285.786)",
          "chart-4": "oklch(0.37 0.013 285.805)",
          "chart-5": "oklch(0.274 0.006 286.033)",
          sidebar: "oklch(0.21 0.006 285.885)",
          "sidebar-foreground": "oklch(0.985 0 0)",
          "sidebar-primary": "oklch(0.488 0.243 264.376)",
          "sidebar-primary-foreground": "oklch(0.985 0 0)",
          "sidebar-accent": "oklch(0.274 0.006 286.033)",
          "sidebar-accent-foreground": "oklch(0.985 0 0)",
          "sidebar-border": "oklch(1 0 0 / 10%)",
          "sidebar-ring": "oklch(0.552 0.016 285.938)"
        }
      }
    },
    {
      name: "mauve",
      title: "Mauve",
      type: "registry:theme",
      cssVars: {
        light: {
          background: "oklch(1 0 0)",
          foreground: "oklch(0.145 0.008 326)",
          card: "oklch(1 0 0)",
          "card-foreground": "oklch(0.145 0.008 326)",
          popover: "oklch(1 0 0)",
          "popover-foreground": "oklch(0.145 0.008 326)",
          primary: "oklch(0.212 0.019 322.12)",
          "primary-foreground": "oklch(0.985 0 0)",
          secondary: "oklch(0.96 0.003 325.6)",
          "secondary-foreground": "oklch(0.212 0.019 322.12)",
          muted: "oklch(0.96 0.003 325.6)",
          "muted-foreground": "oklch(0.542 0.034 322.5)",
          accent: "oklch(0.96 0.003 325.6)",
          "accent-foreground": "oklch(0.212 0.019 322.12)",
          destructive: "oklch(0.577 0.245 27.325)",
          border: "oklch(0.922 0.005 325.62)",
          input: "oklch(0.922 0.005 325.62)",
          ring: "oklch(0.711 0.019 323.02)",
          "chart-1": "oklch(0.865 0.012 325.68)",
          "chart-2": "oklch(0.542 0.034 322.5)",
          "chart-3": "oklch(0.435 0.029 321.78)",
          "chart-4": "oklch(0.364 0.029 323.89)",
          "chart-5": "oklch(0.263 0.024 320.12)",
          radius: "0.625rem",
          sidebar: "oklch(0.985 0 0)",
          "sidebar-foreground": "oklch(0.145 0.008 326)",
          "sidebar-primary": "oklch(0.212 0.019 322.12)",
          "sidebar-primary-foreground": "oklch(0.985 0 0)",
          "sidebar-accent": "oklch(0.96 0.003 325.6)",
          "sidebar-accent-foreground": "oklch(0.212 0.019 322.12)",
          "sidebar-border": "oklch(0.922 0.005 325.62)",
          "sidebar-ring": "oklch(0.711 0.019 323.02)"
        },
        dark: {
          background: "oklch(0.145 0.008 326)",
          foreground: "oklch(0.985 0 0)",
          card: "oklch(0.212 0.019 322.12)",
          "card-foreground": "oklch(0.985 0 0)",
          popover: "oklch(0.212 0.019 322.12)",
          "popover-foreground": "oklch(0.985 0 0)",
          primary: "oklch(0.922 0.005 325.62)",
          "primary-foreground": "oklch(0.212 0.019 322.12)",
          secondary: "oklch(0.263 0.024 320.12)",
          "secondary-foreground": "oklch(0.985 0 0)",
          muted: "oklch(0.263 0.024 320.12)",
          "muted-foreground": "oklch(0.711 0.019 323.02)",
          accent: "oklch(0.263 0.024 320.12)",
          "accent-foreground": "oklch(0.985 0 0)",
          destructive: "oklch(0.704 0.191 22.216)",
          border: "oklch(1 0 0 / 10%)",
          input: "oklch(1 0 0 / 15%)",
          ring: "oklch(0.542 0.034 322.5)",
          "chart-1": "oklch(0.865 0.012 325.68)",
          "chart-2": "oklch(0.542 0.034 322.5)",
          "chart-3": "oklch(0.435 0.029 321.78)",
          "chart-4": "oklch(0.364 0.029 323.89)",
          "chart-5": "oklch(0.263 0.024 320.12)",
          sidebar: "oklch(0.212 0.019 322.12)",
          "sidebar-foreground": "oklch(0.985 0 0)",
          "sidebar-primary": "oklch(0.488 0.243 264.376)",
          "sidebar-primary-foreground": "oklch(0.985 0 0)",
          "sidebar-accent": "oklch(0.263 0.024 320.12)",
          "sidebar-accent-foreground": "oklch(0.985 0 0)",
          "sidebar-border": "oklch(1 0 0 / 10%)",
          "sidebar-ring": "oklch(0.542 0.034 322.5)"
        }
      }
    },
    {
      name: "olive",
      title: "Olive",
      type: "registry:theme",
      cssVars: {
        light: {
          background: "oklch(1 0 0)",
          foreground: "oklch(0.153 0.006 107.1)",
          card: "oklch(1 0 0)",
          "card-foreground": "oklch(0.153 0.006 107.1)",
          popover: "oklch(1 0 0)",
          "popover-foreground": "oklch(0.153 0.006 107.1)",
          primary: "oklch(0.228 0.013 107.4)",
          "primary-foreground": "oklch(0.988 0.003 106.5)",
          secondary: "oklch(0.966 0.005 106.5)",
          "secondary-foreground": "oklch(0.228 0.013 107.4)",
          muted: "oklch(0.966 0.005 106.5)",
          "muted-foreground": "oklch(0.58 0.031 107.3)",
          accent: "oklch(0.966 0.005 106.5)",
          "accent-foreground": "oklch(0.228 0.013 107.4)",
          destructive: "oklch(0.577 0.245 27.325)",
          border: "oklch(0.93 0.007 106.5)",
          input: "oklch(0.93 0.007 106.5)",
          ring: "oklch(0.737 0.021 106.9)",
          "chart-1": "oklch(0.88 0.011 106.6)",
          "chart-2": "oklch(0.58 0.031 107.3)",
          "chart-3": "oklch(0.466 0.025 107.3)",
          "chart-4": "oklch(0.394 0.023 107.4)",
          "chart-5": "oklch(0.286 0.016 107.4)",
          radius: "0.625rem",
          sidebar: "oklch(0.988 0.003 106.5)",
          "sidebar-foreground": "oklch(0.153 0.006 107.1)",
          "sidebar-primary": "oklch(0.228 0.013 107.4)",
          "sidebar-primary-foreground": "oklch(0.988 0.003 106.5)",
          "sidebar-accent": "oklch(0.966 0.005 106.5)",
          "sidebar-accent-foreground": "oklch(0.228 0.013 107.4)",
          "sidebar-border": "oklch(0.93 0.007 106.5)",
          "sidebar-ring": "oklch(0.737 0.021 106.9)"
        },
        dark: {
          background: "oklch(0.153 0.006 107.1)",
          foreground: "oklch(0.988 0.003 106.5)",
          card: "oklch(0.228 0.013 107.4)",
          "card-foreground": "oklch(0.988 0.003 106.5)",
          popover: "oklch(0.228 0.013 107.4)",
          "popover-foreground": "oklch(0.988 0.003 106.5)",
          primary: "oklch(0.93 0.007 106.5)",
          "primary-foreground": "oklch(0.228 0.013 107.4)",
          secondary: "oklch(0.286 0.016 107.4)",
          "secondary-foreground": "oklch(0.988 0.003 106.5)",
          muted: "oklch(0.286 0.016 107.4)",
          "muted-foreground": "oklch(0.737 0.021 106.9)",
          accent: "oklch(0.286 0.016 107.4)",
          "accent-foreground": "oklch(0.988 0.003 106.5)",
          destructive: "oklch(0.704 0.191 22.216)",
          border: "oklch(1 0 0 / 10%)",
          input: "oklch(1 0 0 / 15%)",
          ring: "oklch(0.58 0.031 107.3)",
          "chart-1": "oklch(0.88 0.011 106.6)",
          "chart-2": "oklch(0.58 0.031 107.3)",
          "chart-3": "oklch(0.466 0.025 107.3)",
          "chart-4": "oklch(0.394 0.023 107.4)",
          "chart-5": "oklch(0.286 0.016 107.4)",
          sidebar: "oklch(0.228 0.013 107.4)",
          "sidebar-foreground": "oklch(0.988 0.003 106.5)",
          "sidebar-primary": "oklch(0.488 0.243 264.376)",
          "sidebar-primary-foreground": "oklch(0.988 0.003 106.5)",
          "sidebar-accent": "oklch(0.286 0.016 107.4)",
          "sidebar-accent-foreground": "oklch(0.988 0.003 106.5)",
          "sidebar-border": "oklch(1 0 0 / 10%)",
          "sidebar-ring": "oklch(0.58 0.031 107.3)"
        }
      }
    },
    {
      name: "mist",
      title: "Mist",
      type: "registry:theme",
      cssVars: {
        light: {
          background: "oklch(1 0 0)",
          foreground: "oklch(0.148 0.004 228.8)",
          card: "oklch(1 0 0)",
          "card-foreground": "oklch(0.148 0.004 228.8)",
          popover: "oklch(1 0 0)",
          "popover-foreground": "oklch(0.148 0.004 228.8)",
          primary: "oklch(0.218 0.008 223.9)",
          "primary-foreground": "oklch(0.987 0.002 197.1)",
          secondary: "oklch(0.963 0.002 197.1)",
          "secondary-foreground": "oklch(0.218 0.008 223.9)",
          muted: "oklch(0.963 0.002 197.1)",
          "muted-foreground": "oklch(0.56 0.021 213.5)",
          accent: "oklch(0.963 0.002 197.1)",
          "accent-foreground": "oklch(0.218 0.008 223.9)",
          destructive: "oklch(0.577 0.245 27.325)",
          border: "oklch(0.925 0.005 214.3)",
          input: "oklch(0.925 0.005 214.3)",
          ring: "oklch(0.723 0.014 214.4)",
          "chart-1": "oklch(0.872 0.007 219.6)",
          "chart-2": "oklch(0.56 0.021 213.5)",
          "chart-3": "oklch(0.45 0.017 213.2)",
          "chart-4": "oklch(0.378 0.015 216)",
          "chart-5": "oklch(0.275 0.011 216.9)",
          radius: "0.625rem",
          sidebar: "oklch(0.987 0.002 197.1)",
          "sidebar-foreground": "oklch(0.148 0.004 228.8)",
          "sidebar-primary": "oklch(0.218 0.008 223.9)",
          "sidebar-primary-foreground": "oklch(0.987 0.002 197.1)",
          "sidebar-accent": "oklch(0.963 0.002 197.1)",
          "sidebar-accent-foreground": "oklch(0.218 0.008 223.9)",
          "sidebar-border": "oklch(0.925 0.005 214.3)",
          "sidebar-ring": "oklch(0.723 0.014 214.4)"
        },
        dark: {
          background: "oklch(0.148 0.004 228.8)",
          foreground: "oklch(0.987 0.002 197.1)",
          card: "oklch(0.218 0.008 223.9)",
          "card-foreground": "oklch(0.987 0.002 197.1)",
          popover: "oklch(0.218 0.008 223.9)",
          "popover-foreground": "oklch(0.987 0.002 197.1)",
          primary: "oklch(0.925 0.005 214.3)",
          "primary-foreground": "oklch(0.218 0.008 223.9)",
          secondary: "oklch(0.275 0.011 216.9)",
          "secondary-foreground": "oklch(0.987 0.002 197.1)",
          muted: "oklch(0.275 0.011 216.9)",
          "muted-foreground": "oklch(0.723 0.014 214.4)",
          accent: "oklch(0.275 0.011 216.9)",
          "accent-foreground": "oklch(0.987 0.002 197.1)",
          destructive: "oklch(0.704 0.191 22.216)",
          border: "oklch(1 0 0 / 10%)",
          input: "oklch(1 0 0 / 15%)",
          ring: "oklch(0.56 0.021 213.5)",
          "chart-1": "oklch(0.872 0.007 219.6)",
          "chart-2": "oklch(0.56 0.021 213.5)",
          "chart-3": "oklch(0.45 0.017 213.2)",
          "chart-4": "oklch(0.378 0.015 216)",
          "chart-5": "oklch(0.275 0.011 216.9)",
          sidebar: "oklch(0.218 0.008 223.9)",
          "sidebar-foreground": "oklch(0.987 0.002 197.1)",
          "sidebar-primary": "oklch(0.488 0.243 264.376)",
          "sidebar-primary-foreground": "oklch(0.987 0.002 197.1)",
          "sidebar-accent": "oklch(0.275 0.011 216.9)",
          "sidebar-accent-foreground": "oklch(0.987 0.002 197.1)",
          "sidebar-border": "oklch(1 0 0 / 10%)",
          "sidebar-ring": "oklch(0.56 0.021 213.5)"
        }
      }
    },
    {
      name: "taupe",
      title: "Taupe",
      type: "registry:theme",
      cssVars: {
        light: {
          background: "oklch(1 0 0)",
          foreground: "oklch(0.147 0.004 49.3)",
          card: "oklch(1 0 0)",
          "card-foreground": "oklch(0.147 0.004 49.3)",
          popover: "oklch(1 0 0)",
          "popover-foreground": "oklch(0.147 0.004 49.3)",
          primary: "oklch(0.214 0.009 43.1)",
          "primary-foreground": "oklch(0.986 0.002 67.8)",
          secondary: "oklch(0.96 0.002 17.2)",
          "secondary-foreground": "oklch(0.214 0.009 43.1)",
          muted: "oklch(0.96 0.002 17.2)",
          "muted-foreground": "oklch(0.547 0.021 43.1)",
          accent: "oklch(0.96 0.002 17.2)",
          "accent-foreground": "oklch(0.214 0.009 43.1)",
          destructive: "oklch(0.577 0.245 27.325)",
          border: "oklch(0.922 0.005 34.3)",
          input: "oklch(0.922 0.005 34.3)",
          ring: "oklch(0.714 0.014 41.2)",
          "chart-1": "oklch(0.868 0.007 39.5)",
          "chart-2": "oklch(0.547 0.021 43.1)",
          "chart-3": "oklch(0.438 0.017 39.3)",
          "chart-4": "oklch(0.367 0.016 35.7)",
          "chart-5": "oklch(0.268 0.011 36.5)",
          radius: "0.625rem",
          sidebar: "oklch(0.986 0.002 67.8)",
          "sidebar-foreground": "oklch(0.147 0.004 49.3)",
          "sidebar-primary": "oklch(0.214 0.009 43.1)",
          "sidebar-primary-foreground": "oklch(0.986 0.002 67.8)",
          "sidebar-accent": "oklch(0.96 0.002 17.2)",
          "sidebar-accent-foreground": "oklch(0.214 0.009 43.1)",
          "sidebar-border": "oklch(0.922 0.005 34.3)",
          "sidebar-ring": "oklch(0.714 0.014 41.2)"
        },
        dark: {
          background: "oklch(0.147 0.004 49.3)",
          foreground: "oklch(0.986 0.002 67.8)",
          card: "oklch(0.214 0.009 43.1)",
          "card-foreground": "oklch(0.986 0.002 67.8)",
          popover: "oklch(0.214 0.009 43.1)",
          "popover-foreground": "oklch(0.986 0.002 67.8)",
          primary: "oklch(0.922 0.005 34.3)",
          "primary-foreground": "oklch(0.214 0.009 43.1)",
          secondary: "oklch(0.268 0.011 36.5)",
          "secondary-foreground": "oklch(0.986 0.002 67.8)",
          muted: "oklch(0.268 0.011 36.5)",
          "muted-foreground": "oklch(0.714 0.014 41.2)",
          accent: "oklch(0.268 0.011 36.5)",
          "accent-foreground": "oklch(0.986 0.002 67.8)",
          destructive: "oklch(0.704 0.191 22.216)",
          border: "oklch(1 0 0 / 10%)",
          input: "oklch(1 0 0 / 15%)",
          ring: "oklch(0.547 0.021 43.1)",
          "chart-1": "oklch(0.868 0.007 39.5)",
          "chart-2": "oklch(0.547 0.021 43.1)",
          "chart-3": "oklch(0.438 0.017 39.3)",
          "chart-4": "oklch(0.367 0.016 35.7)",
          "chart-5": "oklch(0.268 0.011 36.5)",
          sidebar: "oklch(0.214 0.009 43.1)",
          "sidebar-foreground": "oklch(0.986 0.002 67.8)",
          "sidebar-primary": "oklch(0.488 0.243 264.376)",
          "sidebar-primary-foreground": "oklch(0.986 0.002 67.8)",
          "sidebar-accent": "oklch(0.268 0.011 36.5)",
          "sidebar-accent-foreground": "oklch(0.986 0.002 67.8)",
          "sidebar-border": "oklch(1 0 0 / 10%)",
          "sidebar-ring": "oklch(0.547 0.021 43.1)"
        }
      }
    },
    {
      name: "amber",
      title: "Amber",
      type: "registry:theme",
      cssVars: {
        light: {
          primary: "oklch(0.555 0.163 48.998)",
          "primary-foreground": "oklch(0.987 0.022 95.277)",
          secondary: "oklch(0.967 0.001 286.375)",
          "secondary-foreground": "oklch(0.21 0.006 285.885)",
          "chart-1": "oklch(0.879 0.169 91.605)",
          "chart-2": "oklch(0.769 0.188 70.08)",
          "chart-3": "oklch(0.666 0.179 58.318)",
          "chart-4": "oklch(0.555 0.163 48.998)",
          "chart-5": "oklch(0.473 0.137 46.201)",
          "sidebar-primary": "oklch(0.666 0.179 58.318)",
          "sidebar-primary-foreground": "oklch(0.987 0.022 95.277)"
        },
        dark: {
          primary: "oklch(0.473 0.137 46.201)",
          "primary-foreground": "oklch(0.987 0.022 95.277)",
          secondary: "oklch(0.274 0.006 286.033)",
          "secondary-foreground": "oklch(0.985 0 0)",
          "chart-1": "oklch(0.879 0.169 91.605)",
          "chart-2": "oklch(0.769 0.188 70.08)",
          "chart-3": "oklch(0.666 0.179 58.318)",
          "chart-4": "oklch(0.555 0.163 48.998)",
          "chart-5": "oklch(0.473 0.137 46.201)",
          "sidebar-primary": "oklch(0.769 0.188 70.08)",
          "sidebar-primary-foreground": "oklch(0.279 0.077 45.635)"
        }
      }
    },
    {
      name: "blue",
      title: "Blue",
      type: "registry:theme",
      cssVars: {
        light: {
          primary: "oklch(0.488 0.243 264.376)",
          "primary-foreground": "oklch(0.97 0.014 254.604)",
          secondary: "oklch(0.967 0.001 286.375)",
          "secondary-foreground": "oklch(0.21 0.006 285.885)",
          "chart-1": "oklch(0.809 0.105 251.813)",
          "chart-2": "oklch(0.623 0.214 259.815)",
          "chart-3": "oklch(0.546 0.245 262.881)",
          "chart-4": "oklch(0.488 0.243 264.376)",
          "chart-5": "oklch(0.424 0.199 265.638)",
          "sidebar-primary": "oklch(0.546 0.245 262.881)",
          "sidebar-primary-foreground": "oklch(0.97 0.014 254.604)"
        },
        dark: {
          primary: "oklch(0.424 0.199 265.638)",
          "primary-foreground": "oklch(0.97 0.014 254.604)",
          secondary: "oklch(0.274 0.006 286.033)",
          "secondary-foreground": "oklch(0.985 0 0)",
          "chart-1": "oklch(0.809 0.105 251.813)",
          "chart-2": "oklch(0.623 0.214 259.815)",
          "chart-3": "oklch(0.546 0.245 262.881)",
          "chart-4": "oklch(0.488 0.243 264.376)",
          "chart-5": "oklch(0.424 0.199 265.638)",
          "sidebar-primary": "oklch(0.623 0.214 259.815)",
          "sidebar-primary-foreground": "oklch(0.97 0.014 254.604)"
        }
      }
    },
    {
      name: "cyan",
      title: "Cyan",
      type: "registry:theme",
      cssVars: {
        light: {
          primary: "oklch(0.52 0.105 223.128)",
          "primary-foreground": "oklch(0.984 0.019 200.873)",
          secondary: "oklch(0.967 0.001 286.375)",
          "secondary-foreground": "oklch(0.21 0.006 285.885)",
          "chart-1": "oklch(0.865 0.127 207.078)",
          "chart-2": "oklch(0.715 0.143 215.221)",
          "chart-3": "oklch(0.609 0.126 221.723)",
          "chart-4": "oklch(0.52 0.105 223.128)",
          "chart-5": "oklch(0.45 0.085 224.283)",
          "sidebar-primary": "oklch(0.609 0.126 221.723)",
          "sidebar-primary-foreground": "oklch(0.984 0.019 200.873)"
        },
        dark: {
          primary: "oklch(0.45 0.085 224.283)",
          "primary-foreground": "oklch(0.984 0.019 200.873)",
          secondary: "oklch(0.274 0.006 286.033)",
          "secondary-foreground": "oklch(0.985 0 0)",
          "chart-1": "oklch(0.865 0.127 207.078)",
          "chart-2": "oklch(0.715 0.143 215.221)",
          "chart-3": "oklch(0.609 0.126 221.723)",
          "chart-4": "oklch(0.52 0.105 223.128)",
          "chart-5": "oklch(0.45 0.085 224.283)",
          "sidebar-primary": "oklch(0.715 0.143 215.221)",
          "sidebar-primary-foreground": "oklch(0.302 0.056 229.695)"
        }
      }
    },
    {
      name: "emerald",
      title: "Emerald",
      type: "registry:theme",
      cssVars: {
        light: {
          primary: "oklch(0.508 0.118 165.612)",
          "primary-foreground": "oklch(0.979 0.021 166.113)",
          secondary: "oklch(0.967 0.001 286.375)",
          "secondary-foreground": "oklch(0.21 0.006 285.885)",
          "chart-1": "oklch(0.845 0.143 164.978)",
          "chart-2": "oklch(0.696 0.17 162.48)",
          "chart-3": "oklch(0.596 0.145 163.225)",
          "chart-4": "oklch(0.508 0.118 165.612)",
          "chart-5": "oklch(0.432 0.095 166.913)",
          "sidebar-primary": "oklch(0.596 0.145 163.225)",
          "sidebar-primary-foreground": "oklch(0.979 0.021 166.113)"
        },
        dark: {
          primary: "oklch(0.432 0.095 166.913)",
          "primary-foreground": "oklch(0.979 0.021 166.113)",
          secondary: "oklch(0.274 0.006 286.033)",
          "secondary-foreground": "oklch(0.985 0 0)",
          "chart-1": "oklch(0.845 0.143 164.978)",
          "chart-2": "oklch(0.696 0.17 162.48)",
          "chart-3": "oklch(0.596 0.145 163.225)",
          "chart-4": "oklch(0.508 0.118 165.612)",
          "chart-5": "oklch(0.432 0.095 166.913)",
          "sidebar-primary": "oklch(0.696 0.17 162.48)",
          "sidebar-primary-foreground": "oklch(0.262 0.051 172.552)"
        }
      }
    },
    {
      name: "fuchsia",
      title: "Fuchsia",
      type: "registry:theme",
      cssVars: {
        light: {
          primary: "oklch(0.518 0.253 323.949)",
          "primary-foreground": "oklch(0.977 0.017 320.058)",
          secondary: "oklch(0.967 0.001 286.375)",
          "secondary-foreground": "oklch(0.21 0.006 285.885)",
          "chart-1": "oklch(0.833 0.145 321.434)",
          "chart-2": "oklch(0.667 0.295 322.15)",
          "chart-3": "oklch(0.591 0.293 322.896)",
          "chart-4": "oklch(0.518 0.253 323.949)",
          "chart-5": "oklch(0.452 0.211 324.591)",
          "sidebar-primary": "oklch(0.591 0.293 322.896)",
          "sidebar-primary-foreground": "oklch(0.977 0.017 320.058)"
        },
        dark: {
          primary: "oklch(0.452 0.211 324.591)",
          "primary-foreground": "oklch(0.977 0.017 320.058)",
          secondary: "oklch(0.274 0.006 286.033)",
          "secondary-foreground": "oklch(0.985 0 0)",
          "chart-1": "oklch(0.833 0.145 321.434)",
          "chart-2": "oklch(0.667 0.295 322.15)",
          "chart-3": "oklch(0.591 0.293 322.896)",
          "chart-4": "oklch(0.518 0.253 323.949)",
          "chart-5": "oklch(0.452 0.211 324.591)",
          "sidebar-primary": "oklch(0.667 0.295 322.15)",
          "sidebar-primary-foreground": "oklch(0.977 0.017 320.058)"
        }
      }
    },
    {
      name: "green",
      title: "Green",
      type: "registry:theme",
      cssVars: {
        light: {
          primary: "oklch(0.527 0.154 150.069)",
          "primary-foreground": "oklch(0.982 0.018 155.826)",
          secondary: "oklch(0.967 0.001 286.375)",
          "secondary-foreground": "oklch(0.21 0.006 285.885)",
          "chart-1": "oklch(0.871 0.15 154.449)",
          "chart-2": "oklch(0.723 0.219 149.579)",
          "chart-3": "oklch(0.627 0.194 149.214)",
          "chart-4": "oklch(0.527 0.154 150.069)",
          "chart-5": "oklch(0.448 0.119 151.328)",
          "sidebar-primary": "oklch(0.627 0.194 149.214)",
          "sidebar-primary-foreground": "oklch(0.982 0.018 155.826)"
        },
        dark: {
          primary: "oklch(0.448 0.119 151.328)",
          "primary-foreground": "oklch(0.982 0.018 155.826)",
          secondary: "oklch(0.274 0.006 286.033)",
          "secondary-foreground": "oklch(0.985 0 0)",
          "chart-1": "oklch(0.871 0.15 154.449)",
          "chart-2": "oklch(0.723 0.219 149.579)",
          "chart-3": "oklch(0.627 0.194 149.214)",
          "chart-4": "oklch(0.527 0.154 150.069)",
          "chart-5": "oklch(0.448 0.119 151.328)",
          "sidebar-primary": "oklch(0.723 0.219 149.579)",
          "sidebar-primary-foreground": "oklch(0.982 0.018 155.826)"
        }
      }
    },
    {
      name: "indigo",
      title: "Indigo",
      type: "registry:theme",
      cssVars: {
        light: {
          primary: "oklch(0.457 0.24 277.023)",
          "primary-foreground": "oklch(0.962 0.018 272.314)",
          secondary: "oklch(0.967 0.001 286.375)",
          "secondary-foreground": "oklch(0.21 0.006 285.885)",
          "chart-1": "oklch(0.785 0.115 274.713)",
          "chart-2": "oklch(0.585 0.233 277.117)",
          "chart-3": "oklch(0.511 0.262 276.966)",
          "chart-4": "oklch(0.457 0.24 277.023)",
          "chart-5": "oklch(0.398 0.195 277.366)",
          "sidebar-primary": "oklch(0.511 0.262 276.966)",
          "sidebar-primary-foreground": "oklch(0.962 0.018 272.314)"
        },
        dark: {
          primary: "oklch(0.398 0.195 277.366)",
          "primary-foreground": "oklch(0.962 0.018 272.314)",
          secondary: "oklch(0.274 0.006 286.033)",
          "secondary-foreground": "oklch(0.985 0 0)",
          "chart-1": "oklch(0.785 0.115 274.713)",
          "chart-2": "oklch(0.585 0.233 277.117)",
          "chart-3": "oklch(0.511 0.262 276.966)",
          "chart-4": "oklch(0.457 0.24 277.023)",
          "chart-5": "oklch(0.398 0.195 277.366)",
          "sidebar-primary": "oklch(0.585 0.233 277.117)",
          "sidebar-primary-foreground": "oklch(0.962 0.018 272.314)"
        }
      }
    },
    {
      name: "lime",
      title: "Lime",
      type: "registry:theme",
      cssVars: {
        light: {
          primary: "oklch(0.841 0.238 128.85)",
          "primary-foreground": "oklch(0.405 0.101 131.063)",
          secondary: "oklch(0.967 0.001 286.375)",
          "secondary-foreground": "oklch(0.21 0.006 285.885)",
          "chart-1": "oklch(0.897 0.196 126.665)",
          "chart-2": "oklch(0.768 0.233 130.85)",
          "chart-3": "oklch(0.648 0.2 131.684)",
          "chart-4": "oklch(0.532 0.157 131.589)",
          "chart-5": "oklch(0.453 0.124 130.933)",
          "sidebar-primary": "oklch(0.648 0.2 131.684)",
          "sidebar-primary-foreground": "oklch(0.986 0.031 120.757)"
        },
        dark: {
          primary: "oklch(0.768 0.233 130.85)",
          "primary-foreground": "oklch(0.405 0.101 131.063)",
          secondary: "oklch(0.274 0.006 286.033)",
          "secondary-foreground": "oklch(0.985 0 0)",
          "chart-1": "oklch(0.897 0.196 126.665)",
          "chart-2": "oklch(0.768 0.233 130.85)",
          "chart-3": "oklch(0.648 0.2 131.684)",
          "chart-4": "oklch(0.532 0.157 131.589)",
          "chart-5": "oklch(0.453 0.124 130.933)",
          "sidebar-primary": "oklch(0.768 0.233 130.85)",
          "sidebar-primary-foreground": "oklch(0.274 0.072 132.109)"
        }
      }
    },
    {
      name: "orange",
      title: "Orange",
      type: "registry:theme",
      cssVars: {
        light: {
          primary: "oklch(0.553 0.195 38.402)",
          "primary-foreground": "oklch(0.98 0.016 73.684)",
          secondary: "oklch(0.967 0.001 286.375)",
          "secondary-foreground": "oklch(0.21 0.006 285.885)",
          "chart-1": "oklch(0.837 0.128 66.29)",
          "chart-2": "oklch(0.705 0.213 47.604)",
          "chart-3": "oklch(0.646 0.222 41.116)",
          "chart-4": "oklch(0.553 0.195 38.402)",
          "chart-5": "oklch(0.47 0.157 37.304)",
          "sidebar-primary": "oklch(0.646 0.222 41.116)",
          "sidebar-primary-foreground": "oklch(0.98 0.016 73.684)"
        },
        dark: {
          primary: "oklch(0.47 0.157 37.304)",
          "primary-foreground": "oklch(0.98 0.016 73.684)",
          secondary: "oklch(0.274 0.006 286.033)",
          "secondary-foreground": "oklch(0.985 0 0)",
          "chart-1": "oklch(0.837 0.128 66.29)",
          "chart-2": "oklch(0.705 0.213 47.604)",
          "chart-3": "oklch(0.646 0.222 41.116)",
          "chart-4": "oklch(0.553 0.195 38.402)",
          "chart-5": "oklch(0.47 0.157 37.304)",
          "sidebar-primary": "oklch(0.705 0.213 47.604)",
          "sidebar-primary-foreground": "oklch(0.98 0.016 73.684)"
        }
      }
    },
    {
      name: "pink",
      title: "Pink",
      type: "registry:theme",
      cssVars: {
        light: {
          primary: "oklch(0.525 0.223 3.958)",
          "primary-foreground": "oklch(0.971 0.014 343.198)",
          secondary: "oklch(0.967 0.001 286.375)",
          "secondary-foreground": "oklch(0.21 0.006 285.885)",
          "chart-1": "oklch(0.823 0.12 346.018)",
          "chart-2": "oklch(0.656 0.241 354.308)",
          "chart-3": "oklch(0.592 0.249 0.584)",
          "chart-4": "oklch(0.525 0.223 3.958)",
          "chart-5": "oklch(0.459 0.187 3.815)",
          "sidebar-primary": "oklch(0.592 0.249 0.584)",
          "sidebar-primary-foreground": "oklch(0.971 0.014 343.198)"
        },
        dark: {
          primary: "oklch(0.459 0.187 3.815)",
          "primary-foreground": "oklch(0.971 0.014 343.198)",
          secondary: "oklch(0.274 0.006 286.033)",
          "secondary-foreground": "oklch(0.985 0 0)",
          "chart-1": "oklch(0.823 0.12 346.018)",
          "chart-2": "oklch(0.656 0.241 354.308)",
          "chart-3": "oklch(0.592 0.249 0.584)",
          "chart-4": "oklch(0.525 0.223 3.958)",
          "chart-5": "oklch(0.459 0.187 3.815)",
          "sidebar-primary": "oklch(0.656 0.241 354.308)",
          "sidebar-primary-foreground": "oklch(0.971 0.014 343.198)"
        }
      }
    },
    {
      name: "purple",
      title: "Purple",
      type: "registry:theme",
      cssVars: {
        light: {
          primary: "oklch(0.496 0.265 301.924)",
          "primary-foreground": "oklch(0.977 0.014 308.299)",
          secondary: "oklch(0.967 0.001 286.375)",
          "secondary-foreground": "oklch(0.21 0.006 285.885)",
          "chart-1": "oklch(0.827 0.119 306.383)",
          "chart-2": "oklch(0.627 0.265 303.9)",
          "chart-3": "oklch(0.558 0.288 302.321)",
          "chart-4": "oklch(0.496 0.265 301.924)",
          "chart-5": "oklch(0.438 0.218 303.724)",
          "sidebar-primary": "oklch(0.558 0.288 302.321)",
          "sidebar-primary-foreground": "oklch(0.977 0.014 308.299)"
        },
        dark: {
          primary: "oklch(0.438 0.218 303.724)",
          "primary-foreground": "oklch(0.977 0.014 308.299)",
          secondary: "oklch(0.274 0.006 286.033)",
          "secondary-foreground": "oklch(0.985 0 0)",
          "chart-1": "oklch(0.827 0.119 306.383)",
          "chart-2": "oklch(0.627 0.265 303.9)",
          "chart-3": "oklch(0.558 0.288 302.321)",
          "chart-4": "oklch(0.496 0.265 301.924)",
          "chart-5": "oklch(0.438 0.218 303.724)",
          "sidebar-primary": "oklch(0.627 0.265 303.9)",
          "sidebar-primary-foreground": "oklch(0.977 0.014 308.299)"
        }
      }
    },
    {
      name: "red",
      title: "Red",
      type: "registry:theme",
      cssVars: {
        light: {
          primary: "oklch(0.505 0.213 27.518)",
          "primary-foreground": "oklch(0.971 0.013 17.38)",
          secondary: "oklch(0.967 0.001 286.375)",
          "secondary-foreground": "oklch(0.21 0.006 285.885)",
          "chart-1": "oklch(0.808 0.114 19.571)",
          "chart-2": "oklch(0.637 0.237 25.331)",
          "chart-3": "oklch(0.577 0.245 27.325)",
          "chart-4": "oklch(0.505 0.213 27.518)",
          "chart-5": "oklch(0.444 0.177 26.899)",
          "sidebar-primary": "oklch(0.577 0.245 27.325)",
          "sidebar-primary-foreground": "oklch(0.971 0.013 17.38)"
        },
        dark: {
          primary: "oklch(0.444 0.177 26.899)",
          "primary-foreground": "oklch(0.971 0.013 17.38)",
          secondary: "oklch(0.274 0.006 286.033)",
          "secondary-foreground": "oklch(0.985 0 0)",
          "chart-1": "oklch(0.808 0.114 19.571)",
          "chart-2": "oklch(0.637 0.237 25.331)",
          "chart-3": "oklch(0.577 0.245 27.325)",
          "chart-4": "oklch(0.505 0.213 27.518)",
          "chart-5": "oklch(0.444 0.177 26.899)",
          "sidebar-primary": "oklch(0.637 0.237 25.331)",
          "sidebar-primary-foreground": "oklch(0.971 0.013 17.38)"
        }
      }
    },
    {
      name: "rose",
      title: "Rose",
      type: "registry:theme",
      cssVars: {
        light: {
          primary: "oklch(0.514 0.222 16.935)",
          "primary-foreground": "oklch(0.969 0.015 12.422)",
          secondary: "oklch(0.967 0.001 286.375)",
          "secondary-foreground": "oklch(0.21 0.006 285.885)",
          "chart-1": "oklch(0.81 0.117 11.638)",
          "chart-2": "oklch(0.645 0.246 16.439)",
          "chart-3": "oklch(0.586 0.253 17.585)",
          "chart-4": "oklch(0.514 0.222 16.935)",
          "chart-5": "oklch(0.455 0.188 13.697)",
          "sidebar-primary": "oklch(0.586 0.253 17.585)",
          "sidebar-primary-foreground": "oklch(0.969 0.015 12.422)"
        },
        dark: {
          primary: "oklch(0.455 0.188 13.697)",
          "primary-foreground": "oklch(0.969 0.015 12.422)",
          secondary: "oklch(0.274 0.006 286.033)",
          "secondary-foreground": "oklch(0.985 0 0)",
          "chart-1": "oklch(0.81 0.117 11.638)",
          "chart-2": "oklch(0.645 0.246 16.439)",
          "chart-3": "oklch(0.586 0.253 17.585)",
          "chart-4": "oklch(0.514 0.222 16.935)",
          "chart-5": "oklch(0.455 0.188 13.697)",
          sidebar: "oklch(0.21 0.006 285.885)",
          "sidebar-primary": "oklch(0.645 0.246 16.439)",
          "sidebar-primary-foreground": "oklch(0.969 0.015 12.422)"
        }
      }
    },
    {
      name: "sky",
      title: "Sky",
      type: "registry:theme",
      cssVars: {
        light: {
          primary: "oklch(0.5 0.134 242.749)",
          "primary-foreground": "oklch(0.977 0.013 236.62)",
          secondary: "oklch(0.967 0.001 286.375)",
          "secondary-foreground": "oklch(0.21 0.006 285.885)",
          "chart-1": "oklch(0.828 0.111 230.318)",
          "chart-2": "oklch(0.685 0.169 237.323)",
          "chart-3": "oklch(0.588 0.158 241.966)",
          "chart-4": "oklch(0.5 0.134 242.749)",
          "chart-5": "oklch(0.443 0.11 240.79)",
          "sidebar-primary": "oklch(0.588 0.158 241.966)",
          "sidebar-primary-foreground": "oklch(0.977 0.013 236.62)"
        },
        dark: {
          primary: "oklch(0.443 0.11 240.79)",
          "primary-foreground": "oklch(0.977 0.013 236.62)",
          secondary: "oklch(0.274 0.006 286.033)",
          "secondary-foreground": "oklch(0.985 0 0)",
          "chart-1": "oklch(0.828 0.111 230.318)",
          "chart-2": "oklch(0.685 0.169 237.323)",
          "chart-3": "oklch(0.588 0.158 241.966)",
          "chart-4": "oklch(0.5 0.134 242.749)",
          "chart-5": "oklch(0.443 0.11 240.79)",
          "sidebar-primary": "oklch(0.685 0.169 237.323)",
          "sidebar-primary-foreground": "oklch(0.293 0.066 243.157)"
        }
      }
    },
    {
      name: "teal",
      title: "Teal",
      type: "registry:theme",
      cssVars: {
        light: {
          primary: "oklch(0.511 0.096 186.391)",
          "primary-foreground": "oklch(0.984 0.014 180.72)",
          secondary: "oklch(0.967 0.001 286.375)",
          "secondary-foreground": "oklch(0.21 0.006 285.885)",
          "chart-1": "oklch(0.855 0.138 181.071)",
          "chart-2": "oklch(0.704 0.14 182.503)",
          "chart-3": "oklch(0.6 0.118 184.704)",
          "chart-4": "oklch(0.511 0.096 186.391)",
          "chart-5": "oklch(0.437 0.078 188.216)",
          "sidebar-primary": "oklch(0.6 0.118 184.704)",
          "sidebar-primary-foreground": "oklch(0.984 0.014 180.72)"
        },
        dark: {
          primary: "oklch(0.437 0.078 188.216)",
          "primary-foreground": "oklch(0.984 0.014 180.72)",
          secondary: "oklch(0.274 0.006 286.033)",
          "secondary-foreground": "oklch(0.985 0 0)",
          "chart-1": "oklch(0.855 0.138 181.071)",
          "chart-2": "oklch(0.704 0.14 182.503)",
          "chart-3": "oklch(0.6 0.118 184.704)",
          "chart-4": "oklch(0.511 0.096 186.391)",
          "chart-5": "oklch(0.437 0.078 188.216)",
          "sidebar-primary": "oklch(0.704 0.14 182.503)",
          "sidebar-primary-foreground": "oklch(0.277 0.046 192.524)"
        }
      }
    },
    {
      name: "violet",
      title: "Violet",
      type: "registry:theme",
      cssVars: {
        light: {
          primary: "oklch(0.491 0.27 292.581)",
          "primary-foreground": "oklch(0.969 0.016 293.756)",
          secondary: "oklch(0.967 0.001 286.375)",
          "secondary-foreground": "oklch(0.21 0.006 285.885)",
          "chart-1": "oklch(0.811 0.111 293.571)",
          "chart-2": "oklch(0.606 0.25 292.717)",
          "chart-3": "oklch(0.541 0.281 293.009)",
          "chart-4": "oklch(0.491 0.27 292.581)",
          "chart-5": "oklch(0.432 0.232 292.759)",
          "sidebar-primary": "oklch(0.541 0.281 293.009)",
          "sidebar-primary-foreground": "oklch(0.969 0.016 293.756)"
        },
        dark: {
          primary: "oklch(0.432 0.232 292.759)",
          "primary-foreground": "oklch(0.969 0.016 293.756)",
          secondary: "oklch(0.274 0.006 286.033)",
          "secondary-foreground": "oklch(0.985 0 0)",
          "chart-1": "oklch(0.811 0.111 293.571)",
          "chart-2": "oklch(0.606 0.25 292.717)",
          "chart-3": "oklch(0.541 0.281 293.009)",
          "chart-4": "oklch(0.491 0.27 292.581)",
          "chart-5": "oklch(0.432 0.232 292.759)",
          "sidebar-primary": "oklch(0.606 0.25 292.717)",
          "sidebar-primary-foreground": "oklch(0.969 0.016 293.756)"
        }
      }
    },
    {
      name: "yellow",
      title: "Yellow",
      type: "registry:theme",
      cssVars: {
        light: {
          primary: "oklch(0.852 0.199 91.936)",
          "primary-foreground": "oklch(0.421 0.095 57.708)",
          secondary: "oklch(0.967 0.001 286.375)",
          "secondary-foreground": "oklch(0.21 0.006 285.885)",
          "chart-1": "oklch(0.905 0.182 98.111)",
          "chart-2": "oklch(0.795 0.184 86.047)",
          "chart-3": "oklch(0.681 0.162 75.834)",
          "chart-4": "oklch(0.554 0.135 66.442)",
          "chart-5": "oklch(0.476 0.114 61.907)",
          "sidebar-primary": "oklch(0.681 0.162 75.834)",
          "sidebar-primary-foreground": "oklch(0.987 0.026 102.212)"
        },
        dark: {
          primary: "oklch(0.795 0.184 86.047)",
          "primary-foreground": "oklch(0.421 0.095 57.708)",
          secondary: "oklch(0.274 0.006 286.033)",
          "secondary-foreground": "oklch(0.985 0 0)",
          "chart-1": "oklch(0.905 0.182 98.111)",
          "chart-2": "oklch(0.795 0.184 86.047)",
          "chart-3": "oklch(0.681 0.162 75.834)",
          "chart-4": "oklch(0.554 0.135 66.442)",
          "chart-5": "oklch(0.476 0.114 61.907)",
          "sidebar-primary": "oklch(0.795 0.184 86.047)",
          "sidebar-primary-foreground": "oklch(0.987 0.026 102.212)"
        }
      }
    }
  ];

  // src/preset-theme.ts
  var DEFAULT_PRESET = {
    baseColor: "neutral",
    theme: "neutral",
    chartColor: "neutral",
    font: "inter",
    fontHeading: "inherit",
    radius: "default"
  };
  var RADIUS_VALUES = {
    default: void 0,
    none: "0",
    small: "0.45rem",
    medium: "0.625rem",
    large: "0.875rem"
  };
  var TOKEN_ORDER = [
    "background",
    "foreground",
    "card",
    "card-foreground",
    "popover",
    "popover-foreground",
    "primary",
    "primary-foreground",
    "secondary",
    "secondary-foreground",
    "muted",
    "muted-foreground",
    "accent",
    "accent-foreground",
    "destructive",
    "border",
    "input",
    "ring",
    "chart-1",
    "chart-2",
    "chart-3",
    "chart-4",
    "chart-5",
    "sidebar",
    "sidebar-foreground",
    "sidebar-primary",
    "sidebar-primary-foreground",
    "sidebar-accent",
    "sidebar-accent-foreground",
    "sidebar-border",
    "sidebar-ring"
  ];
  var toRgb = converter_default("rgb");
  var themeDefinitions = THEMES;
  function getTheme(name) {
    var _a2;
    return (_a2 = themeDefinitions.find((theme) => theme.name === name)) != null ? _a2 : null;
  }
  function resolvePresetFromCode(code) {
    var _a2, _b;
    const decoded = p4(code);
    if (!decoded || m(decoded) !== code) {
      return null;
    }
    const effectiveChartColor = (_b = (_a2 = decoded.chartColor) != null ? _a2 : N[decoded.theme]) != null ? _b : decoded.theme;
    const effectiveRadius = decoded.style === "lyra" ? "none" : decoded.radius;
    return __spreadProps(__spreadValues({}, decoded), {
      code,
      effectiveChartColor,
      effectiveRadius
    });
  }
  function ensureThemeName(name, fallback) {
    var _a2, _b;
    return (_b = (_a2 = getTheme(name)) == null ? void 0 : _a2.name) != null ? _b : fallback;
  }
  function buildThemeVars(config) {
    var _a2, _b, _c, _d, _e, _f, _g, _h, _i2, _j, _k, _l, _m, _n;
    const baseTheme = getTheme(config.baseColor);
    const accentTheme = getTheme(config.theme);
    const chartTheme = getTheme(config.chartColor);
    const lightVars = __spreadValues(__spreadValues({}, (_b = (_a2 = baseTheme == null ? void 0 : baseTheme.cssVars) == null ? void 0 : _a2.light) != null ? _b : {}), (_d = (_c = accentTheme == null ? void 0 : accentTheme.cssVars) == null ? void 0 : _c.light) != null ? _d : {});
    const darkVars = __spreadValues(__spreadValues({}, (_f = (_e = baseTheme == null ? void 0 : baseTheme.cssVars) == null ? void 0 : _e.dark) != null ? _f : {}), (_h = (_g = accentTheme == null ? void 0 : accentTheme.cssVars) == null ? void 0 : _g.dark) != null ? _h : {});
    for (let index = 1; index <= 5; index++) {
      const key = `chart-${index}`;
      const chartLight = (_j = (_i2 = chartTheme == null ? void 0 : chartTheme.cssVars) == null ? void 0 : _i2.light) == null ? void 0 : _j[key];
      const chartDark = (_l = (_k = chartTheme == null ? void 0 : chartTheme.cssVars) == null ? void 0 : _k.dark) == null ? void 0 : _l[key];
      if (chartLight) lightVars[key] = chartLight;
      if (chartDark) darkVars[key] = chartDark;
    }
    if (config.menuAccent === "bold") {
      lightVars.accent = lightVars.primary;
      lightVars["accent-foreground"] = lightVars["primary-foreground"];
      darkVars.accent = darkVars.primary;
      darkVars["accent-foreground"] = darkVars["primary-foreground"];
    }
    const resolvedRadius = (_n = (_m = RADIUS_VALUES[config.radius]) != null ? _m : lightVars.radius) != null ? _n : darkVars.radius;
    if (resolvedRadius) {
      lightVars.radius = resolvedRadius;
      darkVars.radius = resolvedRadius;
    }
    return { lightVars, darkVars };
  }
  function cssColorToRgba(input) {
    var _a2;
    const color = toRgb(parse_default(input));
    if (!color || color.r == null || color.g == null || color.b == null) {
      throw new Error(`Could not convert color "${input}" to RGB.`);
    }
    return {
      r: Math.max(0, Math.min(1, color.r)),
      g: Math.max(0, Math.min(1, color.g)),
      b: Math.max(0, Math.min(1, color.b)),
      a: Math.max(0, Math.min(1, (_a2 = color.alpha) != null ? _a2 : 1))
    };
  }
  function titleCase(value) {
    return value.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
  }
  function sortTokens(tokens) {
    const ordered = TOKEN_ORDER.filter((token) => tokens.includes(token));
    const extras = tokens.filter((token) => !TOKEN_ORDER.includes(token)).sort((left, right) => left.localeCompare(right));
    return [...ordered, ...extras];
  }
  function generateVariablePayload(presetCode, requestedCollectionName) {
    var _a2, _b;
    const resolved = resolvePresetFromCode(presetCode.trim());
    if (!resolved) {
      throw new Error("Invalid or non-canonical preset code.");
    }
    const baseColor = ensureThemeName(
      resolved.baseColor,
      DEFAULT_PRESET.baseColor
    );
    const theme = ensureThemeName(resolved.theme, DEFAULT_PRESET.theme);
    const chartColor = ensureThemeName(
      resolved.effectiveChartColor,
      DEFAULT_PRESET.chartColor
    );
    const { lightVars, darkVars } = buildThemeVars({
      baseColor,
      theme,
      chartColor,
      menuAccent: resolved.menuAccent,
      radius: resolved.effectiveRadius
    });
    const colorTokens = sortTokens(
      Array.from(
        /* @__PURE__ */ new Set([...Object.keys(lightVars), ...Object.keys(darkVars)])
      ).filter((token) => token !== "radius")
    );
    const colors = colorTokens.map((token) => {
      var _a3;
      const light = lightVars[token];
      const dark = (_a3 = darkVars[token]) != null ? _a3 : light;
      if (!light) {
        throw new Error(
          `Missing light token "${token}" for preset ${presetCode}.`
        );
      }
      return {
        name: `color/${token}`,
        light: cssColorToRgba(light),
        dark: cssColorToRgba(dark)
      };
    });
    const strings = [
      { name: "meta/preset-code", value: resolved.code },
      { name: "meta/style", value: resolved.style },
      { name: "meta/base-color", value: resolved.baseColor },
      { name: "meta/theme", value: resolved.theme },
      { name: "meta/chart-color", value: resolved.effectiveChartColor },
      { name: "meta/icon-library", value: resolved.iconLibrary },
      { name: "meta/menu-accent", value: resolved.menuAccent },
      { name: "meta/menu-color", value: resolved.menuColor },
      { name: "font/body", value: titleCase(resolved.font) },
      {
        name: "font/heading",
        value: resolved.fontHeading === "inherit" ? titleCase(resolved.font) : titleCase(resolved.fontHeading)
      },
      {
        name: "radius/css",
        value: (_b = (_a2 = lightVars.radius) != null ? _a2 : darkVars.radius) != null ? _b : "0.625rem"
      }
    ];
    return {
      collectionName: (requestedCollectionName == null ? void 0 : requestedCollectionName.trim()) || `Shadcn Preset/${resolved.code}`,
      presetCode: resolved.code,
      summary: `${resolved.style} \u2022 ${resolved.baseColor}/${resolved.theme} \u2022 ${resolved.effectiveChartColor}`,
      colors,
      strings
    };
  }

  // src/ui-html.ts
  var _a;
  var uiHtml = String.raw(_a || (_a = __template(['<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>Shadcn Preset Variables</title>\n    <style>\n      :root {\n        color-scheme: light dark;\n        font-family: Inter, system-ui, sans-serif;\n        --bg: #ffffff;\n        --fg: #111827;\n        --muted: #6b7280;\n        --border: #d1d5db;\n        --button: #111827;\n        --button-fg: #ffffff;\n        --surface: #f3f4f6;\n        --surface-success: #ecfdf5;\n        --surface-success-fg: #166534;\n        --surface-error: #fef2f2;\n        --surface-error-fg: #991b1b;\n      }\n\n      @media (prefers-color-scheme: dark) {\n        :root {\n          --bg: #1f1f1f;\n          --fg: #f9fafb;\n          --muted: #a1a1aa;\n          --border: #3f3f46;\n          --button: #52525b;\n          --button-fg: #ffffff;\n          --surface: #27272a;\n          --surface-success: #052e16;\n          --surface-success-fg: #86efac;\n          --surface-error: #450a0a;\n          --surface-error-fg: #fca5a5;\n        }\n      }\n\n      body {\n        margin: 0;\n        padding: 16px;\n        background: var(--bg);\n        color: var(--fg);\n      }\n\n      .stack {\n        display: grid;\n        gap: 12px;\n      }\n\n      .copy {\n        margin: 0;\n        color: var(--muted);\n        font-size: 12px;\n        line-height: 1.5;\n      }\n\n      label {\n        display: grid;\n        gap: 6px;\n        font-size: 12px;\n        font-weight: 600;\n        color: var(--fg);\n      }\n\n      input {\n        width: 100%;\n        box-sizing: border-box;\n        border: 1px solid var(--border);\n        border-radius: 10px;\n        padding: 10px 12px;\n        font: inherit;\n        font-size: 14px;\n        background: var(--bg);\n        color: var(--fg);\n      }\n\n      input::placeholder {\n        color: var(--muted);\n      }\n\n      button {\n        border: 0;\n        border-radius: 10px;\n        padding: 10px 12px;\n        background: var(--button);\n        color: var(--button-fg);\n        font: inherit;\n        font-weight: 600;\n        cursor: pointer;\n      }\n\n      button:disabled {\n        opacity: 0.6;\n        cursor: wait;\n      }\n\n      .status {\n        min-height: 40px;\n        border-radius: 12px;\n        padding: 10px 12px;\n        background: var(--surface);\n        font-size: 12px;\n        line-height: 1.5;\n        white-space: pre-wrap;\n      }\n\n      .status.error {\n        background: var(--surface-error);\n        color: var(--surface-error-fg);\n      }\n\n      .status.success {\n        background: var(--surface-success);\n        color: var(--surface-success-fg);\n      }\n    </style>\n  </head>\n  <body>\n    <form id="form" class="stack">\n      <div class="stack" style="gap: 4px">\n        <h1 style="margin: 0; font-size: 16px">Preset -> Figma Variables</h1>\n        <p class="copy">\n          Paste a canonical shadcn preset code. The plugin will generate or\n          update one local Figma variable collection with Light and Dark modes.\n        </p>\n      </div>\n\n      <label>\n        Preset code\n        <input id="preset-code" name="presetCode" value="b0" spellcheck="false" />\n      </label>\n\n      <label>\n        Collection name\n        <input\n          id="collection-name"\n          name="collectionName"\n          value="Shadcn Preset/b0"\n          spellcheck="false"\n        />\n      </label>\n\n      <button id="submit" type="submit">Generate variables</button>\n\n      <div id="status" class="status">\nCreates color variables for semantic theme tokens plus string variables for\npreset metadata, fonts, and radius.\n      </div>\n    </form>\n\n    <script>\n      const form = document.getElementById("form")\n      const submit = document.getElementById("submit")\n      const presetCode = document.getElementById("preset-code")\n      const collectionName = document.getElementById("collection-name")\n      const status = document.getElementById("status")\n\n      function setStatus(kind, message) {\n        status.className = "status" + (kind ? " " + kind : "")\n        status.textContent = message\n      }\n\n      presetCode.addEventListener("input", () => {\n        const value = presetCode.value.trim()\n        if (!collectionName.dataset.touched) {\n          collectionName.value = value\n            ? "Shadcn Preset/" + value\n            : "Shadcn Preset"\n        }\n      })\n\n      collectionName.addEventListener("input", () => {\n        collectionName.dataset.touched = "true"\n      })\n\n      form.addEventListener("submit", (event) => {\n        event.preventDefault()\n        submit.disabled = true\n        setStatus("", "Generating Figma variables...")\n\n        parent.postMessage(\n          {\n            pluginMessage: {\n              type: "generate-variables",\n              presetCode: presetCode.value,\n              collectionName: collectionName.value,\n            },\n          },\n          "*"\n        )\n      })\n\n      window.addEventListener("message", (event) => {\n        const message = event.data.pluginMessage\n        if (!message) return\n\n        if (message.type === "generate-success") {\n          submit.disabled = false\n          setStatus(\n            "success",\n            [\n              "Collection: " + message.collectionName,\n              "Preset: " + message.presetCode,\n              "Created/updated: " + message.variableCount + " variables",\n              message.summary,\n            ].join("\n")\n          )\n        }\n\n        if (message.type === "generate-error") {\n          submit.disabled = false\n          setStatus("error", message.error)\n        }\n      })\n    <\/script>\n  </body>\n</html>\n'], ['<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>Shadcn Preset Variables</title>\n    <style>\n      :root {\n        color-scheme: light dark;\n        font-family: Inter, system-ui, sans-serif;\n        --bg: #ffffff;\n        --fg: #111827;\n        --muted: #6b7280;\n        --border: #d1d5db;\n        --button: #111827;\n        --button-fg: #ffffff;\n        --surface: #f3f4f6;\n        --surface-success: #ecfdf5;\n        --surface-success-fg: #166534;\n        --surface-error: #fef2f2;\n        --surface-error-fg: #991b1b;\n      }\n\n      @media (prefers-color-scheme: dark) {\n        :root {\n          --bg: #1f1f1f;\n          --fg: #f9fafb;\n          --muted: #a1a1aa;\n          --border: #3f3f46;\n          --button: #52525b;\n          --button-fg: #ffffff;\n          --surface: #27272a;\n          --surface-success: #052e16;\n          --surface-success-fg: #86efac;\n          --surface-error: #450a0a;\n          --surface-error-fg: #fca5a5;\n        }\n      }\n\n      body {\n        margin: 0;\n        padding: 16px;\n        background: var(--bg);\n        color: var(--fg);\n      }\n\n      .stack {\n        display: grid;\n        gap: 12px;\n      }\n\n      .copy {\n        margin: 0;\n        color: var(--muted);\n        font-size: 12px;\n        line-height: 1.5;\n      }\n\n      label {\n        display: grid;\n        gap: 6px;\n        font-size: 12px;\n        font-weight: 600;\n        color: var(--fg);\n      }\n\n      input {\n        width: 100%;\n        box-sizing: border-box;\n        border: 1px solid var(--border);\n        border-radius: 10px;\n        padding: 10px 12px;\n        font: inherit;\n        font-size: 14px;\n        background: var(--bg);\n        color: var(--fg);\n      }\n\n      input::placeholder {\n        color: var(--muted);\n      }\n\n      button {\n        border: 0;\n        border-radius: 10px;\n        padding: 10px 12px;\n        background: var(--button);\n        color: var(--button-fg);\n        font: inherit;\n        font-weight: 600;\n        cursor: pointer;\n      }\n\n      button:disabled {\n        opacity: 0.6;\n        cursor: wait;\n      }\n\n      .status {\n        min-height: 40px;\n        border-radius: 12px;\n        padding: 10px 12px;\n        background: var(--surface);\n        font-size: 12px;\n        line-height: 1.5;\n        white-space: pre-wrap;\n      }\n\n      .status.error {\n        background: var(--surface-error);\n        color: var(--surface-error-fg);\n      }\n\n      .status.success {\n        background: var(--surface-success);\n        color: var(--surface-success-fg);\n      }\n    </style>\n  </head>\n  <body>\n    <form id="form" class="stack">\n      <div class="stack" style="gap: 4px">\n        <h1 style="margin: 0; font-size: 16px">Preset -> Figma Variables</h1>\n        <p class="copy">\n          Paste a canonical shadcn preset code. The plugin will generate or\n          update one local Figma variable collection with Light and Dark modes.\n        </p>\n      </div>\n\n      <label>\n        Preset code\n        <input id="preset-code" name="presetCode" value="b0" spellcheck="false" />\n      </label>\n\n      <label>\n        Collection name\n        <input\n          id="collection-name"\n          name="collectionName"\n          value="Shadcn Preset/b0"\n          spellcheck="false"\n        />\n      </label>\n\n      <button id="submit" type="submit">Generate variables</button>\n\n      <div id="status" class="status">\nCreates color variables for semantic theme tokens plus string variables for\npreset metadata, fonts, and radius.\n      </div>\n    </form>\n\n    <script>\n      const form = document.getElementById("form")\n      const submit = document.getElementById("submit")\n      const presetCode = document.getElementById("preset-code")\n      const collectionName = document.getElementById("collection-name")\n      const status = document.getElementById("status")\n\n      function setStatus(kind, message) {\n        status.className = "status" + (kind ? " " + kind : "")\n        status.textContent = message\n      }\n\n      presetCode.addEventListener("input", () => {\n        const value = presetCode.value.trim()\n        if (!collectionName.dataset.touched) {\n          collectionName.value = value\n            ? "Shadcn Preset/" + value\n            : "Shadcn Preset"\n        }\n      })\n\n      collectionName.addEventListener("input", () => {\n        collectionName.dataset.touched = "true"\n      })\n\n      form.addEventListener("submit", (event) => {\n        event.preventDefault()\n        submit.disabled = true\n        setStatus("", "Generating Figma variables...")\n\n        parent.postMessage(\n          {\n            pluginMessage: {\n              type: "generate-variables",\n              presetCode: presetCode.value,\n              collectionName: collectionName.value,\n            },\n          },\n          "*"\n        )\n      })\n\n      window.addEventListener("message", (event) => {\n        const message = event.data.pluginMessage\n        if (!message) return\n\n        if (message.type === "generate-success") {\n          submit.disabled = false\n          setStatus(\n            "success",\n            [\n              "Collection: " + message.collectionName,\n              "Preset: " + message.presetCode,\n              "Created/updated: " + message.variableCount + " variables",\n              message.summary,\n            ].join("\\n")\n          )\n        }\n\n        if (message.type === "generate-error") {\n          submit.disabled = false\n          setStatus("error", message.error)\n        }\n      })\n    <\/script>\n  </body>\n</html>\n'])));

  // src/code.ts
  function getOrCreateCollection(name) {
    var _a2;
    return (_a2 = figma.variables.getLocalVariableCollections().find((collection) => collection.name === name)) != null ? _a2 : figma.variables.createVariableCollection(name);
  }
  function ensureModes(collection) {
    var _a2;
    const lightMode = collection.modes[0];
    if (lightMode.name !== "Light") {
      collection.renameMode(lightMode.modeId, "Light");
    }
    const existingDarkMode = collection.modes.find((mode) => mode.name === "Dark");
    const darkModeId = (_a2 = existingDarkMode == null ? void 0 : existingDarkMode.modeId) != null ? _a2 : collection.addMode("Dark");
    return {
      lightModeId: lightMode.modeId,
      darkModeId
    };
  }
  function getOrCreateVariable(collection, name, resolvedType) {
    var _a2;
    return (_a2 = figma.variables.getLocalVariables(resolvedType).find(
      (variable) => variable.variableCollectionId === collection.id && variable.name === name
    )) != null ? _a2 : figma.variables.createVariable(name, collection, resolvedType);
  }
  function createOrUpdateVariables(collection, payload) {
    const { lightModeId, darkModeId } = ensureModes(collection);
    for (const colorVariable of payload.colors) {
      const variable = getOrCreateVariable(collection, colorVariable.name, "COLOR");
      variable.setValueForMode(lightModeId, colorVariable.light);
      variable.setValueForMode(darkModeId, colorVariable.dark);
    }
    for (const stringVariable of payload.strings) {
      const variable = getOrCreateVariable(collection, stringVariable.name, "STRING");
      variable.setValueForMode(lightModeId, stringVariable.value);
      variable.setValueForMode(darkModeId, stringVariable.value);
    }
    return payload.colors.length + payload.strings.length;
  }
  figma.showUI(uiHtml, {
    width: 420,
    height: 360,
    themeColors: true
  });
  figma.ui.onmessage = (message) => {
    if (message.type !== "generate-variables") {
      return;
    }
    try {
      const payload = generateVariablePayload(
        message.presetCode,
        message.collectionName
      );
      const collection = getOrCreateCollection(payload.collectionName);
      const variableCount = createOrUpdateVariables(collection, payload);
      figma.notify(`Updated ${variableCount} variables in ${payload.collectionName}.`);
      figma.ui.postMessage({
        type: "generate-success",
        collectionName: payload.collectionName,
        presetCode: payload.presetCode,
        summary: payload.summary,
        variableCount
      });
    } catch (error) {
      const message2 = error instanceof Error ? error.message : "Could not generate variables.";
      figma.ui.postMessage({
        type: "generate-error",
        error: message2
      });
    }
  };
})();
//# sourceMappingURL=code.js.map
