import m3 from "utils/m3";

export let canvasMatrix: Matrix3;

function calcMatrix() {
  requestAnimationFrame(() => {
    canvasMatrix = m3.projectionFlipY(
      window.gl.drawingBufferWidth,
      window.gl.drawingBufferHeight
    );
  });
}

export function initCanvasMatrix() {
  calcMatrix();
  window.addEventListener("resize", calcMatrix);
}
