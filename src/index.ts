import "./styles/index.scss";
import initControlPanel from "./utils/ui/initEditMenu";
import { initResizeEvent } from "utils/resize";
import initWebGL2 from "utils/WebGL/initWebGL2";
import setupRenderTarget from "renders/setupRenderTarget";
import initEditMenu from "./utils/ui/initEditMenu";
import setupVideo from "utils/setupVideo";

function getAngleAToB(x1: number, y1: number, x2: number, y2: number) {
  return Math.atan2(x2 - x1, y1 - y2);
}

export const SIZE = 256;
let dt = 1;
const diffusion = 0;
const viscosity = 0;

// tips form mozilla! https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices

function createPreview(): VoidFunction {
  const container = document.createElement("section");
  container.classList.add("preview");
  document.body.appendChild(container);

  const canvas = document.createElement("canvas");
  container.appendChild(canvas);

  const gl = initWebGL2(canvas);
  initResizeEvent(gl);

  // initControlPanel(canvasNode);

  if (!gl) {
    throw Error(
      "canvas.getContext returns null! Probably WebGL context is lost!"
    );
  }

  return () => {
    setupRenderTarget(gl, null, [0.7, 0.7, 0.7, 1]);
    // requestAnimationFrame(draw);
    // Tell it to use our program (pair of shaders)
  };
}

function updateImageDisplay(input: HTMLInputElement) {
  // event.currentTarget.files
  console.log(input.files);
  const curFiles = input.files;
  if (curFiles === null || curFiles.length === 0) {
    // checking array is needed by TS only, it's always an array with "multiple" attribute
    console.log("no file");
  } else {
    for (const file of curFiles as any) {
      // para.textContent = `File name ${file.name}, file size ${returnFileSize(file.size)}.`;
      setupVideo(URL.createObjectURL(file), () => console.log("callback"));
    }
  }
}

function createTimeline(): VoidFunction {
  const container = document.createElement("section");
  container.classList.add("timeline");
  document.body.appendChild(container);

  const addBtn = document.createElement("label");
  addBtn.classList.add("add-btn");
  addBtn.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" width="100%" height="100%" viewBox="0 0 45.402 45.402"><path d="M41.267,18.557H26.832V4.134C26.832,1.851,24.99,0,22.707,0c-2.283,0-4.124,1.851-4.124,4.135v14.432H4.141   c-2.283,0-4.139,1.851-4.138,4.135c-0.001,1.141,0.46,2.187,1.207,2.934c0.748,0.749,1.78,1.222,2.92,1.222h14.453V41.27   c0,1.142,0.453,2.176,1.201,2.922c0.748,0.748,1.777,1.211,2.919,1.211c2.282,0,4.129-1.851,4.129-4.133V26.857h14.435   c2.283,0,4.134-1.867,4.133-4.15C45.399,20.425,43.548,18.557,41.267,18.557z"/></svg>';
  container.appendChild(addBtn);

  const fileInput = document.createElement("input");
  fileInput.setAttribute("type", "file");
  fileInput.setAttribute("accept", "video/*");
  fileInput.setAttribute("multiple", "true");
  fileInput.addEventListener("change", () => updateImageDisplay(fileInput));
  addBtn.appendChild(fileInput);

  const canvas = document.createElement("canvas");
  container.appendChild(canvas);

  const gl = initWebGL2(canvas);
  initResizeEvent(gl);

  if (!gl) {
    throw Error(
      "canvas.getContext returns null! Probably WebGL context is lost!"
    );
  }

  return () => {
    setupRenderTarget(gl, null, [0.2, 0.2, 0.2, 1]);
    // requestAnimationFrame(draw);
    // Tell it to use our program (pair of shaders)
  };
}

function main() {
  const updatePreview = createPreview();
  const updateTimeline = createTimeline();
  initEditMenu();

  function draw(now: DOMHighResTimeStamp) {
    updatePreview();
    updateTimeline();
    // requestAnimationFrame(draw);
    // Tell it to use our program (pair of shaders)
  }
  requestAnimationFrame(draw);
}

main();
