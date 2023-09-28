import DrawCircle from "programs/DrawCircle";
import { drawCircle, drawLine } from "programs";
import { canvasMatrix } from "programs/canvasMatrix";

export default function renderIndicator(
  circleVao: ReturnType<DrawCircle["createVAO"]>,
  activeCircleVao: ReturnType<DrawCircle["createVAO"]>,
  [p1, p2]: Line,
  isActive: boolean
) {
  const gl = window.gl;

  if (isActive) {
    const color: vec4 = [0.2, 0.2, 0.2, 0.2];
    drawLine.setup(canvasMatrix, p1, p2, color, color, 30);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.bindVertexArray(null);

    const positions = [p1.x, p1.y, p2.x, p2.y];
    const colors = [...color /* */, ...color];
    activeCircleVao.setPos(new Float32Array(positions));
    activeCircleVao.setColor(new Float32Array(colors));
    drawCircle.setup(activeCircleVao, canvasMatrix);
    gl.drawElementsInstanced(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0, 2);
    gl.bindVertexArray(null);
  }

  const color1: vec4 = isActive ? [1, 1, 1, 1] : [1, 0, 0, 1];
  const color2: vec4 = isActive ? [1, 1, 1, 1] : [0, 1, 0, 1];

  drawLine.setup(canvasMatrix, p1, p2, color1, color2);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  gl.bindVertexArray(null);

  const positions = [p1.x, p1.y, p2.x, p2.y];
  const colors = [...color1 /* */, ...color2];
  circleVao.setPos(new Float32Array(positions));
  circleVao.setColor(new Float32Array(colors));
  drawCircle.setup(circleVao, canvasMatrix);
  gl.drawElementsInstanced(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0, 2);
  gl.bindVertexArray(null);
}
