import { MINIATURE_SIZE, MS_PER_PIXEL } from "consts";
import { State } from "initCreator";
import MiniatureVideo from "models/Video/MiniatureVideo";
import { drawSprite } from "programs";
import { canvasMatrix } from "programs/canvasMatrix";
import setupRenderTarget from "renders/setupRenderTarget";
import { skeletonSize } from "UI";
import m3 from "utils/m3";
import { getAttrs } from "./getAttrs";

const MS_PER_MINIATURE = MS_PER_PIXEL * MINIATURE_SIZE;

function getStartX(currTime: number) {
  const skeleton = skeletonSize.timeline;
  const offset =
    skeleton.x + // skeleton.x is 0 so nto sure if we really need that
    skeleton.width / 2 -
    currTime / MS_PER_PIXEL;

  return offset < 0 ? offset % MINIATURE_SIZE : offset;
}

function getStartTime(currTime: number) {
  const timeOffset =
    currTime - skeletonSize.timeline.width * 0.5 * MS_PER_PIXEL;
  const safeTimeOffset = Math.max(0, timeOffset); // we don't need a time shift until first miniatures hides

  return Math.floor(safeTimeOffset / MS_PER_MINIATURE) * MS_PER_MINIATURE;
}

function getMiniaturesNumber(startTime: number, video: MiniatureVideo) {
  const length = (video.duration - startTime) / MS_PER_PIXEL;
  // the distance from first miniature to the last that we are planning to render
  return Math.ceil(length / MINIATURE_SIZE);
}

let avgValue = 0;
let avgNumber = 0;

export default class Timeline {
  private vao: WebGLVertexArrayObject;

  constructor(videoDuration: number, videoWidth: number, videoHeight: number) {
    this.vao = getAttrs(videoDuration, videoWidth, videoHeight);
  }

  render(state: State) {
    const gl = window.gl;
    const start = performance.now();
    const startX = getStartX(state.currTime);
    const startTime = getStartTime(state.currTime);
    const length = getMiniaturesNumber(startTime, state.video);

    /* setup 3x texture */
    const textureUnit = 0;
    gl.activeTexture(gl.TEXTURE0 + textureUnit); // activate certain texture unit
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, state.video.textureAtlas);

    /* collect all attributes for instance drawing */
    for (let i = 0; i < length; i++) {
      const time = startTime + i * MS_PER_MINIATURE;
      state.video.getMiniature(time, () => state.refresh());
    }

    drawSprite.setup(
      this.vao,
      textureUnit,
      m3.translate(canvasMatrix, startX, skeletonSize.timeline.y),
      Math.ceil(startTime / MS_PER_PIXEL / MINIATURE_SIZE)
    );
    setupRenderTarget(null);
    gl.drawElementsInstanced(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0, length);
    gl.bindVertexArray(null);

    const end = performance.now();
    avgValue += end - start;
    avgNumber++;

    if (avgNumber % 60 === 0) {
      console.log("avg", avgValue / avgNumber);
    }

    gl.enable(gl.SCISSOR_TEST);
    gl.scissor(
      startX +
        (length - 1) * MINIATURE_SIZE +
        (((state.video.duration - startTime) / MS_PER_PIXEL) % MINIATURE_SIZE),
      gl.drawingBufferHeight -
        skeletonSize.timeline.y -
        skeletonSize.timeline.height,
      MINIATURE_SIZE,
      MINIATURE_SIZE
    );
    gl.clearColor(0, 0, 0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.disable(gl.SCISSOR_TEST);
  }
}
