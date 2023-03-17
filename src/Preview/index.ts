import { skeletonSize } from "UI";
import { drawTexture, drawTexture3D } from "programs";
import setupRenderTarget from "renders/setupRenderTarget";
import m3 from "utils/m3";
import { canvasMatrix } from "programs/canvasMatrix";
import { MINI_SIZE, MS_PER_MINI, MS_PER_PIXEL } from "consts";
import Texture from "models/Texture";
import DrawTexture from "programs/DrawTexture";
import DrawTexture3D from "programs/DrawTexture3D";
import MiniatureVideo from "models/Video/MiniatureVideo";
import State from "State";

export function getPreviewVideoSize(video: MiniatureVideo) {
  const preview = skeletonSize.preview;
  const previewAspect = preview.width / preview.height;
  const videoAspect = video.width / video.height;
  let height = preview.width / videoAspect;
  let width = preview.width;

  if (previewAspect > videoAspect) {
    height = preview.height;
    width = preview.height * videoAspect;
  }

  return {
    height,
    width,
  };
}

function getVideoPositionsAttr(video: MiniatureVideo) {
  const preview = skeletonSize.preview;
  const { width, height } = getPreviewVideoSize(video);

  const offsetX = (preview.width - width) * 0.5;
  const offsetY = (preview.height - height) * 0.5;

  return new Float32Array([
    offsetX,
    offsetY,
    offsetX,
    height + offsetY,
    width + offsetX,
    height + offsetY,
    width + offsetX,
    offsetY,
  ]);
}

const MIN_MS_DIFF_TO_FETCH = 30;

export default class Preview {
  private vao2D: ReturnType<DrawTexture["createVAO"]>;
  private vao3D: ReturnType<DrawTexture3D["createVAO"]>;
  private prevTime: number;
  private texture: Texture;
  private isFetching: boolean;
  private lastFetchFrameTime: number;

  constructor(state: State) {
    const texCoords = new Float32Array([0, 0, 0, 1, 1, 1, 1, 0]);
    const indexes = new Uint16Array([0, 1, 2, 0, 2, 3]);
    const depth = new Float32Array([0]);
    const fakeOffsetX = new Float32Array([0]);
    const positions = getVideoPositionsAttr(state.video);

    this.vao2D = drawTexture.createVAO(texCoords, positions, indexes);
    this.vao3D = drawTexture3D.createVAO(
      texCoords,
      positions,
      depth,
      fakeOffsetX,
      indexes
    );
    this.prevTime = 0;
    this.texture = new Texture();
    this.isFetching = false;
    this.lastFetchFrameTime = Infinity;

    window.addEventListener("resize", () => {
      const positions = getVideoPositionsAttr(state.video);
      this.vao2D.updatePosition(positions);
      this.vao3D.updatePosition(positions);
    });
  }

  drawFromCache(state: State, matrix: Mat3, time: number) {
    const gl = window.gl;
    /* setup 3x texture */
    const textureUnit = 0;
    gl.activeTexture(gl.TEXTURE0 + textureUnit); // activate certain texture unit
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, state.video.textureAtlas);

    drawTexture3D.setup(
      this.vao3D.vao,
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
    this.prevTime = state.currTime;

    if (state.video.isPlaying) {
      this.lastFetchFrameTime = state.currTime;
      this.texture.fill(state.video);
      drawTexture.setup(this.vao2D.vao, this.texture.bind(0), canvasMatrix);
      setupRenderTarget(null);
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
      gl.bindVertexArray(null);
      return;
    }

    const speedThreshold = Math.abs(state.currTime - this.prevTime) * 8.75;
    const threshold = Math.min(100, speedThreshold);
    // console.log("threshold", threshold);
    const closestCachedTime =
      Math.round(state.currTime / MS_PER_MINI) * MS_PER_MINI;
    const distanceToClosestCacheTime = Math.abs(
      state.currTime - closestCachedTime
    );

    const distanceToLastFrame = Math.abs(
      this.lastFetchFrameTime - state.currTime
    );
    if (
      distanceToClosestCacheTime <= threshold &&
      distanceToClosestCacheTime < distanceToLastFrame
    ) {
      state.video.requestFrame(closestCachedTime, state.refresh, true);
      this.drawFromCache(state, canvasMatrix, closestCachedTime);
    } else {
      if (!this.isFetching && distanceToLastFrame > MIN_MS_DIFF_TO_FETCH) {
        const time = state.currTime;
        const requestAddedToQueue = state.video.requestFrame(
          time,
          () => {
            this.isFetching = false;
            this.lastFetchFrameTime = time;
            this.texture.fill(state.video);
            state.refresh();
          },
          false
        );
        if (requestAddedToQueue) {
          this.isFetching = true;
        }
      }

      if (this.isFetching && distanceToClosestCacheTime < distanceToLastFrame) {
        this.drawFromCache(state, canvasMatrix, closestCachedTime);
      } else {
        drawTexture.setup(this.vao2D.vao, this.texture.bind(0), canvasMatrix);
        setupRenderTarget(null);
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
        gl.bindVertexArray(null);
      }
    }
  }
}
