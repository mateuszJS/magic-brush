import { drawCircle, drawLine, simpleDrawBezier } from "programs";
import setupRenderTarget from "renders/setupRenderTarget";
import { canvasMatrix } from "programs/canvasMatrix";
import State, { Segment } from "State";
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

  private renderSpline(spline: Segment[], color: vec4) {
    const gl = window.gl;

    const circlePos: number[] = [];
    const circleColor: number[] = [];
    const lines: [Point, Point][] = [];
    const linesColor: vec4[] = [];

    setupRenderTarget(null);

    spline.forEach((segment) => {
      const [p1, p2, p3, p4] = segment.controlPoints;

      simpleDrawBezier.setup(
        this.vao,
        canvasMatrix,
        ...segment.controlPoints,
        color
      );
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, ITER);
      gl.bindVertexArray(null);

      circlePos.push(...segment.controlPoints.flatMap((p) => [p.x, p.y]));
      circleColor.push(
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
        1 //
      );

      lines.push([p1, p2]);
      lines.push([p4, p3]);
      linesColor.push([0, 1, 0, 1]);
      linesColor.push([1, 0, 1, 1]);
    });

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
    if (state.segments.length > 0) {
      setupRenderTarget(null);
      this.renderSpline(state.segments, [0.3, 0.3, 1, 0.5]);
    }
  }
}
