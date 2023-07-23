import { drawBezier, drawBezierPick, drawLine } from "programs";
import setupRenderTarget from "renders/setupRenderTarget";
import { canvasMatrix } from "programs/canvasMatrix";
import DrawBezier from "programs/DrawBezier";
import brushPng from "assets/wave.png";
import Texture from "models/Texture";
import State from "State";
import getBezierPos from "utils/getBezierPos";
import getCurveLength from "utils/getCurveLength";

const ITER = 102;

if (ITER % 2 === 1) {
  throw Error("ITER number must be even");
}
if ((ITER / 2) % 2 === 0) {
  throw Error("ITER number divided by 2 must be odd");
}

const TEX_COORD_PRECISION = 10;

export default class Effects {
  private vao: ReturnType<DrawBezier["createVAO"]>;
  private tex: Texture;
  private brushAspectRatio: number;
  private thickLine: [Point, Point] | null;

  constructor() {
    this.vao = drawBezier.createVAO(ITER);
    this.tex = new Texture();
    this.brushAspectRatio = 1;
    this.thickLine = null;

    const img = new Image();
    img.src = brushPng;
    img.onload = () => {
      this.tex.fill(img);
      this.brushAspectRatio = img.width / img.height;
    };
  }

  private draw(state: State, matrix: Mat3, isPick: boolean) {
    const program = isPick ? drawBezierPick : drawBezier;
    const gl = window.gl;
    const thickness = 200 / this.brushAspectRatio;
    let prevTexCoordYoffset = 0;
    for (let i = 0; i + 2 < state.simplePath.length - 1; i += 3) {
      const p1 = state.simplePath[i + 0];
      const p2 = state.simplePath[i + 1];
      const p3 = state.simplePath[i + 2];
      const p4 = state.simplePath[i + 3];

      const distances = getCurveLength(p1, p2, p3, p4, TEX_COORD_PRECISION);
      const splineOffset = state.currTime / state.video.duration;

      const getTexCoord = (t: number) => {
        const topIndex = Math.ceil(t * TEX_COORD_PRECISION);
        const bottomIndex = Math.floor(t * TEX_COORD_PRECISION);
        const diff = t * TEX_COORD_PRECISION - bottomIndex; // <0, 1>
        const distanceAvg =
          (1 - diff) * distances[bottomIndex] + diff * distances[topIndex];
        const offset = i === 0 ? splineOffset : 0; // just an additional effect to animate the brush
        return prevTexCoordYoffset + distanceAvg / thickness + offset;
      };

      this.vao.updateTexCoordY(getTexCoord);

      const getThickness = (t: number) => {
        const globalT = i / 3 + t; // it's not between two points, it's T of whole path
        const totalGlobalT = state.simplePath.length / 3;
        const progress = globalT / totalGlobalT;
        const lowerPointThick = state.lineWidth.reduce(
          (acc, thickPoint) =>
            thickPoint.progress < progress ? thickPoint : acc,
          state.lineWidth[0]
        );
        const lowerPointThickIndex = state.lineWidth.indexOf(lowerPointThick);
        const upperPointThick = state.lineWidth[lowerPointThickIndex + 1];
        // find two array of state.lineWidth where progress is between them
        // 1. We need to map local t value to state.lineWidth
        const diff =
          (progress - lowerPointThick.progress) /
          (upperPointThick.progress - lowerPointThick.progress);
        const offsetAvg =
          (1 - diff) * lowerPointThick.offset + diff * upperPointThick.offset;

        return offsetAvg;
      };

      this.vao.updateThickness(getThickness);

      program.setup(
        this.vao,
        matrix,
        p1,
        p2,
        p3,
        p4,
        this.tex.bind(0),
        isPick ? i / 3 : 0
      );
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, ITER);
      prevTexCoordYoffset = getTexCoord(1);
    }
    gl.bindVertexArray(null);
  }

  public renderPick(state: State, matrix: Mat3) {
    if (state.simplePath.length < 2) return;

    this.draw(state, matrix, true);
  }

  public render(state: State) {
    if (state.simplePath.length < 2) return;

    setupRenderTarget(null);

    this.draw(state, canvasMatrix, false);
  }
}
