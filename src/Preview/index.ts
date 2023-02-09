import { skeletonSize } from "UI";
import { drawTexture, drawTexture3D } from "programs";
import setupRenderTarget from "renders/setupRenderTarget";
import m3 from "utils/m3";
import { State } from "initCreator";
import { canvasMatrix } from "programs/canvasMatrix";
import { MINI_SIZE, MS_PER_MINI, MS_PER_PIXEL } from "consts";
import Texture from "models/Texture";

export default class Preview {
  private vao2D: WebGLVertexArrayObject;
  private vao3D: WebGLVertexArrayObject;
  private prevTime: number;
  private texture: Texture;
  private isFetching: boolean;
  private lastFetchFrameTime: number;

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
    const depth = new Float32Array([0]);
    const offsetX = new Float32Array([0]);

    this.vao2D = drawTexture.createVAO(texCoords, positions, indexes);
    this.vao3D = drawTexture3D.createVAO(
      texCoords,
      positions,
      depth,
      offsetX,
      indexes
    );
    this.prevTime = 0;
    this.texture = new Texture();
    this.isFetching = false;
    this.lastFetchFrameTime = Infinity;
  }

  drawFromCache(state: State, matrix: Matrix3, time: number) {
    // console.log("render from cache");
    const gl = window.gl;
    /* setup 3x texture */
    const textureUnit = 0;
    gl.activeTexture(gl.TEXTURE0 + textureUnit); // activate certain texture unit
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, state.video.textureAtlas);

    drawTexture3D.setup(
      this.vao3D,
      textureUnit,
      matrix,
      Math.ceil(time / MS_PER_PIXEL / MINI_SIZE)
    );
    setupRenderTarget(null);
    gl.drawElementsInstanced(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0, 1);
    gl.bindVertexArray(null);
  }

  render(state: State) {
    const gl = window.gl;
    const speedThreshold = Math.abs(state.currTime - this.prevTime) * 8.75;
    const threshold = Math.min(100, speedThreshold);
    this.prevTime = state.currTime;
    // console.log("threshold", threshold);
    const closestCachedTime =
      Math.round(state.currTime / MS_PER_MINI) * MS_PER_MINI;
    const distanceToClosestCacheTime = Math.abs(
      state.currTime - closestCachedTime
    );

    const matrix = m3.translate(
      canvasMatrix,
      (gl.drawingBufferWidth -
        (skeletonSize.preview.height * state.video.width) /
          state.video.height) *
        0.5,
      0
    );

    if (state.video.isPlaying && state.video.sourceReady) {
      this.lastFetchFrameTime = state.currTime;
      this.texture.fill(state.video);
      drawTexture.setup(this.vao2D, this.texture.bind(0), matrix);
      setupRenderTarget(null);
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
      gl.bindVertexArray(null);
      return;
    }

    // console.log(distanceToClosestCacheTime, threshold);
    const distanceToLastFrame = Math.abs(
      this.lastFetchFrameTime - state.currTime
    );
    if (
      distanceToClosestCacheTime <= threshold &&
      distanceToClosestCacheTime < distanceToLastFrame
    ) {
      state.video.requestFrame(closestCachedTime, state.refresh, true);
      this.drawFromCache(state, matrix, closestCachedTime);
    } else {
      if (!this.isFetching && distanceToLastFrame > 30) {
        this.isFetching = true;
        const time = state.currTime;
        state.video.requestFrame(
          time,
          () => {
            this.isFetching = false;
            this.lastFetchFrameTime = time;
            this.texture.fill(state.video);
            state.refresh();
          },
          false
        );
      }

      if (this.isFetching && distanceToClosestCacheTime < distanceToLastFrame) {
        // draw from cache
        this.drawFromCache(state, matrix, closestCachedTime);
      } else {
        drawTexture.setup(this.vao2D, this.texture.bind(0), matrix);
        setupRenderTarget(null);
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
        gl.bindVertexArray(null);
      }
    }
  }
}
