//@ts-nocheck

import type LibJimp from "jimp";
import * as _Jimp from "jimp/browser/lib/jimp";

export const Jimp: typeof LibJimp =
  typeof self !== "undefined" ? self.Jimp || _Jimp : _Jimp;
