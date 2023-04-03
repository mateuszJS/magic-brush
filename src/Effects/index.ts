import { drawBezier } from "programs";
import setupRenderTarget from "renders/setupRenderTarget";
import { canvasMatrix } from "programs/canvasMatrix";
import DrawBezier from "programs/DrawBezier";
import brushPng from "assets/pattern.png";
import Texture from "models/Texture";
import State from "State";

const ITER = 102;

if (ITER % 2 === 1) {
  throw Error("ITER number must be even");
}
if ((ITER / 2) % 2 === 0) {
  throw Error("ITER number divided by 2 must be odd");
}

export default class Effects {
  private vao: ReturnType<DrawBezier["createVAO"]>;
  private tex: Texture;

  constructor() {
    this.vao = drawBezier.createVAO(ITER);
    this.tex = new Texture();

    const img = new Image();
    img.src = brushPng;
    img.onload = () => {
      this.tex.fill(img);
    };
  }

  public render(state: State) {
    const gl = window.gl;
    if (state.simplePath.length < 2) return;

    setupRenderTarget(null);
    for (let i = 0; i + 2 < state.simplePath.length - 1; i += 3) {
      const p1 = state.simplePath[i + 0];
      const p2 = state.simplePath[i + 1];
      const p3 = state.simplePath[i + 2];
      const p4 = state.simplePath[i + 3];

      drawBezier.setup(
        this.vao,
        canvasMatrix,
        p1,
        p2,
        p3,
        p4,
        this.tex.bind(0),
        (state.currTime / state.video.duration) * 10
      );
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, ITER);
    }
    gl.bindVertexArray(null);
  }
}
