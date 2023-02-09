import { MINI_SIZE, MS_PER_MINI, MS_PER_PIXEL } from "consts";
import { State } from "initCreator";
import MiniatureVideo from "models/Video/MiniatureVideo";
import { drawTexture3D } from "programs";
import { canvasMatrix } from "programs/canvasMatrix";
import setupRenderTarget from "renders/setupRenderTarget";
import { skeletonSize } from "UI";
import m3 from "utils/m3";
import { getAttrs } from "./getAttrs";

function getStartX(currTime: number) {
  const skeleton = skeletonSize.timeline;
  const offset =
    skeleton.x + // skeleton.x is 0 so nto sure if we really need that
    skeleton.width / 2 -
    currTime / MS_PER_PIXEL;

  return offset < 0 ? offset % MINI_SIZE : offset;
}

function getStartTime(currTime: number) {
  const timeOffset =
    currTime - skeletonSize.timeline.width * 0.5 * MS_PER_PIXEL;
  const safeTimeOffset = Math.max(0, timeOffset); // we don't need a time shift until first miniatures hides

  return Math.floor(safeTimeOffset / MS_PER_MINI) * MS_PER_MINI;
}

let avgValue = 0;
let avgNumber = 0;

export default class Timeline {
  private vao: WebGLVertexArrayObject;

  constructor(videoDuration: number, videoWidth: number, videoHeight: number) {
    const widthWithHidden = skeletonSize.timeline.width + 2 * MINI_SIZE;
    // width including partially visible frames on the right and left side

    const maxMinisQuantity = Math.ceil(widthWithHidden / MINI_SIZE);
    this.vao = getAttrs(maxMinisQuantity, videoWidth, videoHeight);
  }

  render(state: State) {
    const gl = window.gl;
    const start = performance.now();
    const startX = getStartX(state.currTime);
    const startTime = getStartTime(state.currTime);

    const minisEnd =
      skeletonSize.timeline.width / 2 +
      (state.video.duration - state.currTime) / MS_PER_PIXEL;
    const endMinis = Math.min(skeletonSize.timeline.width, minisEnd);
    const minisQuantity = Math.ceil((endMinis - startX) / MINI_SIZE);

    /* setup 3x texture */
    const textureUnit = 0;
    gl.activeTexture(gl.TEXTURE0 + textureUnit); // activate certain texture unit
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, state.video.textureAtlas);

    /* collect all attributes for instance drawing */
    for (let i = 0; i < minisQuantity; i++) {
      const time = startTime + i * MS_PER_MINI;
      state.video.requestFrame(time, state.refresh, true);
    }

    drawTexture3D.setup(
      this.vao,
      textureUnit,
      m3.translate(canvasMatrix, startX, skeletonSize.timeline.y),
      Math.ceil(startTime / MS_PER_PIXEL / MINI_SIZE)
    );
    setupRenderTarget(null);
    gl.drawElementsInstanced(
      gl.TRIANGLES,
      6,
      gl.UNSIGNED_SHORT,
      0,
      minisQuantity
    );
    gl.bindVertexArray(null);

    const end = performance.now();
    avgValue += end - start;
    avgNumber++;

    if (avgNumber % 60 === 0) {
      // console.log("avg", avgValue / avgNumber);
    }
    if (minisEnd < skeletonSize.timeline.width) {
      gl.enable(gl.SCISSOR_TEST);
      gl.scissor(
        minisEnd,
        gl.drawingBufferHeight -
          skeletonSize.timeline.y -
          skeletonSize.timeline.height,
        MINI_SIZE,
        MINI_SIZE
      );
      gl.clearColor(0, 0, 0, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.disable(gl.SCISSOR_TEST);
    }
  }
}
