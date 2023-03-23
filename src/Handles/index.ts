import { skeletonSize } from "UI";
import { drawCircle, drawTexture, drawTexture3D } from "programs";
import setupRenderTarget from "renders/setupRenderTarget";
import m3 from "utils/m3";
import { canvasMatrix } from "programs/canvasMatrix";
import { MINI_SIZE, MS_PER_MINI, MS_PER_PIXEL } from "consts";
import Texture from "models/Texture";
import DrawCircle from "programs/DrawCircle";
import FrameBuffer from "models/FrameBuffer";
import { getIdFromLastRender } from "utils/id";
import State from "State";

const BUFFER_SIZE = 1;

export default class Handles {
  private vao: ReturnType<DrawCircle["createVAO"]>;
  private fbo: FrameBuffer;

  constructor() {
    this.vao = drawCircle.createVAO();
    this.fbo = new FrameBuffer();
    this.fbo.resize(BUFFER_SIZE, BUFFER_SIZE);
  }

  // private translate(matrix: Mat3, state: State) {
  //   const gl = window.gl;

  //   return m3.translate(
  //     matrix,
  //     (gl.drawingBufferWidth -
  //       (skeletonSize.preview.height * state.video.width) /
  //         state.video.height) *
  //       0.5,
  //     0
  //   );
  // }

  public updateSelection = (state: State, x: number, y: number) => {
    const gl = window.gl;
    const snow = state.snow;
    if (!snow) return 0;

    const canvas = gl.canvas as HTMLCanvasElement;
    const pixelX = (-x * canvas.width) / canvas.clientWidth;
    const pixelY = (-y * canvas.height) / canvas.clientHeight;

    const translatedMatrix = m3.translate(
      m3.projectionFlipY(BUFFER_SIZE, BUFFER_SIZE),
      pixelX,
      pixelY
    );

    const positions = snow.curve.flatMap((point) => [point.x, point.y]);
    const colors = snow.curve.flatMap((point) => point.idVec4);
    setupRenderTarget(this.fbo, [0, 0, 0, 1]);
    this.vao.setPos(new Float32Array(positions));
    this.vao.setColor(new Float32Array(colors));
    drawCircle.setup(this.vao, translatedMatrix);
    gl.drawElementsInstanced(
      gl.TRIANGLES,
      6,
      gl.UNSIGNED_SHORT,
      0,
      snow.curve.length
    );

    return getIdFromLastRender();
  };

  public render(state: State) {
    const gl = window.gl;
    const snow = state.snow;
    if (!snow) return;

    const positions = snow.curve.flatMap((point) => [point.x, point.y]);
    const colors = snow.curve.flatMap((point) =>
      state.selectedHandler === point ? [0, 1, 0, 1] : [1, 1, 1, 1]
    );
    setupRenderTarget(null);
    this.vao.setPos(new Float32Array(positions));
    this.vao.setColor(new Float32Array(colors));
    drawCircle.setup(this.vao, canvasMatrix);
    gl.drawElementsInstanced(
      gl.TRIANGLES,
      6,
      gl.UNSIGNED_SHORT,
      0,
      snow.curve.length
    );
  }
}
