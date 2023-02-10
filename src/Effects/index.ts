import { skeletonSize } from "UI";
import { drawCircle, drawTexture, drawTexture3D } from "programs";
import setupRenderTarget from "renders/setupRenderTarget";
import m3 from "utils/m3";
import { State } from "initCreator";
import { canvasMatrix } from "programs/canvasMatrix";
import { MINI_SIZE, MS_PER_MINI, MS_PER_PIXEL } from "consts";
import Texture from "models/Texture";
import DrawCircle from "programs/DrawCircle";

export default class Effects {
  private vao: ReturnType<DrawCircle["createVAO"]>;

  constructor() {
    this.vao = drawCircle.createVAO();
  }

  render(state: State) {
    const gl = window.gl;

    const snow = state.snow;
    if (!snow) return;

    const matrix = m3.translate(
      canvasMatrix,
      (gl.drawingBufferWidth -
        (skeletonSize.preview.height * state.video.width) /
          state.video.height) *
        0.5,
      0
    );

    const positions = snow.curve.flatMap((point) => [point.x, point.y]);
    const colors = snow.curve.flatMap(() => [1, 1, 1, 1]);
    setupRenderTarget(null);
    this.vao.setPos(new Float32Array(positions));
    this.vao.setColor(new Float32Array(colors));
    drawCircle.setup(this.vao, matrix);
    // gl.drawArrays(gl.TRIANGLES, 0, 6 * snow.curve.length);
    gl.drawElementsInstanced(
      gl.TRIANGLES,
      6,
      gl.UNSIGNED_SHORT,
      0,
      snow.curve.length
    );

    // we assume that for now effects DO NOT depend on time at all
    // what it means that it doesn't change over time

    // if (state.video.isPlaying && state.video.sourceReady) {
    //   this.lastFetchFrameTime = state.currTime;
    //   this.texture.fill(state.video);
    //   drawTexture.setup(this.vao2D, this.texture.bind(0), matrix);
    //   setupRenderTarget(null);
    //   gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    //   gl.bindVertexArray(null);
    //   return;
    // }

    // drawTexture.setup(this.vao2D, this.texture.bind(0), matrix);
    // setupRenderTarget(null);
    // gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    // gl.bindVertexArray(null);
  }
}
