import { drawCircle, drawLine, simpleDrawBezier } from "programs";
import setupRenderTarget from "renders/setupRenderTarget";
import { canvasMatrix } from "programs/canvasMatrix";
import State from "State";
import SimpleDrawBezier from "programs/SimpleDrawBezier";
import DrawCircle from "programs/DrawCircle";

const ITER = 10;

export default class CurveSkeleton {
  private vao: ReturnType<SimpleDrawBezier["createVAO"]>;
  private circleVao: ReturnType<DrawCircle["createVAO"]>;

  constructor() {
    this.vao = simpleDrawBezier.createVAO(ITER);
    this.circleVao = drawCircle.createVAO(5);
  }

  private renderSpline(points: Point[], color: vec4) {
    const gl = window.gl;

    let circlePos: number[] = [];
    let circleColor: number[] = [];
    const lines: [Point, Point][] = [];
    const linesColor: vec4[] = [];
    setupRenderTarget(null);
    for (let i = 0; i + 2 < points.length - 1; i += 3) {
      const p1 = points[i + 0];
      const p2 = points[i + 1];
      const p3 = points[i + 2];
      const p4 = points[i + 3];

      simpleDrawBezier.setup(this.vao, canvasMatrix, p1, p2, p3, p4, color);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, ITER);
      gl.bindVertexArray(null);

      circlePos = [
        ...circlePos,
        p1.x,
        p1.y,
        p2.x,
        p2.y,
        p3.x,
        p3.y,
        p4.x,
        p4.y,
      ];
      circleColor = [
        ...circleColor, //
        0,
        0,
        0,
        1, //
        1,
        1,
        1,
        1, //
        1,
        1,
        1,
        1, //
        0,
        0,
        0,
        1, //
      ];

      lines.push([p1, p2]);
      lines.push([p4, p3]);
      linesColor.push([0, 1, 0, 1]);
      linesColor.push([1, 0, 1, 1]);
    }

    lines.forEach(([p1, p2], index) => {
      drawLine.setup(canvasMatrix, p1, p2, linesColor[index], [1, 1, 1, 1]);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      gl.bindVertexArray(null);
    });
    this.circleVao.setPos(new Float32Array(circlePos));
    this.circleVao.setColor(new Float32Array(circleColor));
    drawCircle.setup(this.circleVao, canvasMatrix);
    gl.drawElementsInstanced(
      gl.TRIANGLES,
      6,
      gl.UNSIGNED_SHORT,
      0,
      circlePos.length / 2
    );
    gl.bindVertexArray(null);
  }

  public render(state: State) {
    if (state.simplePath.length >= 2) {
      setupRenderTarget(null);
      this.renderSpline(state.simplePath, [0.3, 0.3, 1, 0.5]);
    }
  }
}
