import m3 from "utils/m3";

export let canvasMatrix: Mat3;

export function calcMatrix() {
  canvasMatrix = m3.projectionFlipY(
    window.gl.drawingBufferWidth,
    window.gl.drawingBufferHeight
  );
}
