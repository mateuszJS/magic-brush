import m3 from "utils/m3";

export let canvasMatrix: Mat3;

export function calcMatrix() {
  // clientWidth - to get CSS Pixel unit
  // drawingBufferWidth - to get real pixels unit
  canvasMatrix = m3.projectionFlipY(
    window.gl.canvas.clientWidth,
    window.gl.canvas.clientHeight
  );
}
