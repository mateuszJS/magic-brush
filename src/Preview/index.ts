import { skeletonSize } from "UI";
import { drawSprite } from "programs";
import setupRenderTarget from "renders/setupRenderTarget";
import m3 from "utils/m3";
import { State } from "initCreator";
import { canvasMatrix } from "programs/canvasMatrix";
import { MINI_SIZE, MS_PER_MINI, MS_PER_PIXEL } from "consts";

export default class Preview {
  private vao: WebGLVertexArrayObject;
  private prevTime: number;

  constructor(videoWidth: number, videoHeight: number) {
    const texCoords = new Float32Array([0, 0, 0, 1, 1, 1, 1, 0]);
    const aspect = videoWidth / videoHeight;
    const positions = new Float32Array([
      0,
      0,
      0,
      skeletonSize.preview.height,
      skeletonSize.preview.height * aspect,
      skeletonSize.preview.height,
      skeletonSize.preview.height * aspect,
      0,
    ]);

    const indexes = new Uint16Array([0, 1, 2, 0, 2, 3]);
    const offsetX = new Float32Array([0]);
    const depth = new Float32Array([0]);

    const vao = drawSprite.createVAO(
      texCoords,
      positions,
      depth,
      offsetX,
      indexes
    );
    this.vao = vao;
    this.prevTime = 0;
  }

  render(state: State) {
    const gl = window.gl;
    const threshold =
      (Math.abs(state.currTime - this.prevTime) * 8.75) / MS_PER_PIXEL; // > 20, use cache
    this.prevTime = state.currTime;
    // console.log("threshold", threshold);
    const distanceToClosestCacheTime = Math.abs(
      state.currTime - Math.round(state.currTime / MS_PER_MINI) * MS_PER_MINI
    );

    // if (distanceToClosestCacheTime < threshold) {
    const cacheTime = Math.round(state.currTime / MS_PER_MINI) * MS_PER_MINI;
    state.video.getMiniature(cacheTime, () => state.refresh());
    // } else {

    // }

    const textureUnit = 0;
    gl.activeTexture(gl.TEXTURE0 + textureUnit); // activate certain texture unit
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, state.video.textureAtlas);

    drawSprite.setup(
      this.vao,
      textureUnit,
      m3.translate(
        canvasMatrix,
        (gl.drawingBufferWidth -
          (skeletonSize.preview.height * state.video.width) /
            state.video.height) *
          0.5,
        0
      ),
      Math.ceil(state.currTime / MS_PER_PIXEL / MINI_SIZE)
    );
    setupRenderTarget(null);
    gl.drawElementsInstanced(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0, 1);
    gl.bindVertexArray(null);
  }
}
