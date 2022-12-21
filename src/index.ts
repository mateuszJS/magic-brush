import "./styles.css";
import createFullFrameCanvas from "./utils/createFullFrameCanvas";
import initControlPanel from "./utils/ui/initControlPanel";
import Texture from "./models/Texture";
import setupDrawTextureToCanvasProgram from "programs/drawTextureToCanvas";
import setupDrawPixelProgram from "programs/drawPixel";

export const SIZE = 256;
let dt = 1;
const diffusion = 0;
const viscosity = 0;

function main() {
  const canvasNode = createFullFrameCanvas(SIZE, SIZE);
  initControlPanel(canvasNode);
  const gl = canvasNode.getContext("webgl");

  if (!gl) {
    throw Error(
      "canvas.getContext returns null! Probably WebGL context is lost!"
    );
  }

  const currDensity = new Texture(gl, [0, 0, 0, 255], SIZE, SIZE);

  const renderDrawPixel = setupDrawPixelProgram(gl);

  let isReady = false;
  window.document.body.addEventListener("mousemove", (event) => {
    if (!isReady) {
      return;
    }
    isReady = false;

    renderDrawPixel(
      currDensity.getTexture(),
      event.clientX / window.innerWidth,
      1 - event.clientY / window.innerHeight
    );
    gl.bindTexture(gl.TEXTURE_2D, currDensity.getTexture()); // ser destination where we should copy
    gl.copyTexImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 0, 0, SIZE, SIZE, 0);

    requestAnimationFrame(() => {
      renderDrawTextureToCanvas(currDensity.getTexture());
      isReady = true;
    });
  });

  const renderDrawTextureToCanvas = setupDrawTextureToCanvasProgram(gl);
  // for density we will need two textures, and same for velocity, current and previous

  function drawScene(now: DOMHighResTimeStamp) {
    now *= 0.001; // convert to seconds
    isReady = true;
    renderDrawTextureToCanvas(currDensity.getTexture());
    // Tell it to use our program (pair of shaders)
  }

  requestAnimationFrame(drawScene);
}

main();
