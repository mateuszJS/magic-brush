import { compilePrograms } from "programs";
import initWebGL2 from "utils/WebGL/initWebGL2";
import "./utils/requestVideoFrameCallbackPolyfill";

document.oncontextmenu = document.body.oncontextmenu = function () {
  return false;
};

const canvas = document.createElement("canvas");
document.body.appendChild(canvas);

window.gl = initWebGL2(canvas);
compilePrograms();

import(/* webpackChunkName: "initApp" */ "initApp").then((module) => {
  module.default();
});
