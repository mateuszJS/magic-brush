import { drawBezier, drawBezierPick, drawLine } from "programs";
import setupRenderTarget from "renders/setupRenderTarget";
import { canvasMatrix } from "programs/canvasMatrix";
import DrawBezier from "programs/DrawBezier";
import brushPng from "assets/wave.png";
import Texture from "models/Texture";
import State, { DEFAULT_OFFSET } from "State";
import getCurveLength from "utils/getCurveLength";
import getPathWidth from "utils/getPathWidth";

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

  constructor() {
    this.vao = drawBezier.createVAO(ITER);
    this.tex = new Texture();
    this.brushAspectRatio = 1;

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
        const globalT = i / 3 + t; // state.widthPoints are divided per segments
        if (state.widthPoints.length === 0) return DEFAULT_OFFSET;

        return getPathWidth(globalT, state);
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
