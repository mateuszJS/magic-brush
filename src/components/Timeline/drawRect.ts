import { dpr } from "consts";

export default function drawRect(
  x: number,
  y: number,
  width: number,
  height: number
) {
  const gl = window.gl;
  gl.enable(gl.SCISSOR_TEST);

  const yFromBottom = gl.canvas.clientHeight - y - height;
  gl.scissor(
    x * dpr,
    yFromBottom * dpr, // y is counted from bottom of the screen
    width * dpr,
    height * dpr
  );
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.disable(gl.SCISSOR_TEST);
}
