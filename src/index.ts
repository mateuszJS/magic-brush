import { compilePrograms } from "programs";
import initWebGL2 from "utils/WebGL/initWebGL2";
import "./utils/requestVideoFrameCallbackPolyfill";

let initCreatorModule: typeof import("./initCreator") | null = null;
let videoUrl: string | null = null;

document.oncontextmenu = document.body.oncontextmenu = function () {
  return false;
};

const canvas = document.createElement("canvas");
document.body.appendChild(canvas);

window.gl = initWebGL2(canvas);
compilePrograms();

function initCreator() {
  if (initCreatorModule && videoUrl) {
    fileInput?.remove();
    initCreatorModule.default(videoUrl);
  }
}

import(/* webpackChunkName: "initCreator" */ "initCreator").then((module) => {
  initCreatorModule = module;
  initCreator();
});

const fileInput = document.querySelector<HTMLInputElement>("#upload");
if (fileInput) {
  fileInput.addEventListener("change", () => {
    const file = fileInput.files?.[0];
    if (file) {
      videoUrl = URL.createObjectURL(file);
      initCreator();
    }
  });
}
