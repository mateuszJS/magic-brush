import { drawBezier } from "programs";
import setupRenderTarget from "renders/setupRenderTarget";
import { canvasMatrix } from "programs/canvasMatrix";
import DrawBezier from "programs/DrawBezier";
import snowFlakePng from "assets/snow-flakes.png";
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
    img.src = snowFlakePng;
    img.onload = () => {
      this.tex.fill(img);
    };
  }

  public render(state: State) {
    const gl = window.gl;
    const snow = state.snow;
    if (!snow) return;

    setupRenderTarget(null);
    const [p1, p2, p3, p4] = snow.curve;
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
}
