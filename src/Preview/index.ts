import { skeletonSize } from "UI";
import { drawSprite } from "programs";
import setupRenderTarget from "renders/setupRenderTarget";
import m3 from "utils/m3";
import { State } from "initCreator";
import { canvasMatrix } from "programs/canvasMatrix";
import { MINIATURE_SIZE, MS_PER_PIXEL } from "consts";

export default class Preview {
  private vao: WebGLVertexArrayObject;

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
  }

  render(state: State) {
    const gl = window.gl;
    // state.video.getMiniature(state.currTime, () => state.refresh());

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
      Math.ceil(state.currTime / MS_PER_PIXEL / MINIATURE_SIZE)
    );
    setupRenderTarget(null);
    gl.drawElementsInstanced(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0, 1);
    gl.bindVertexArray(null);
  }
}
