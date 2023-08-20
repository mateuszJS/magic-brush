import { MINI_SIZE, MS_PER_MINI, MS_PER_PIXEL } from "consts";
import { drawTexture3D } from "programs";
import { canvasMatrix } from "programs/canvasMatrix";
import setupRenderTarget from "renders/setupRenderTarget";
import { skeletonSize } from "UI";
import m3 from "utils/m3";
import { getAttrs } from "./getAttrs";
import State from "State";
import drawRect from "./drawRect";

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

export default class Timeline {
  private vao: WebGLVertexArrayObject;

  constructor(state: State) {
    const { vao, update } = getAttrs(state.video.width, state.video.height);
    this.vao = vao;
    const updateResRelateAttrs = () => {
      const widthWithHidden = skeletonSize.timeline.width + 2 * MINI_SIZE;
      // width including partially visible frames on the right and left side

      const maxMinisQuantity = Math.ceil(widthWithHidden / MINI_SIZE);
      update(maxMinisQuantity);
    };
    window.addEventListener("resize", updateResRelateAttrs);
    updateResRelateAttrs();
  }

  render(state: State) {
    const gl = window.gl;
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

    if (minisEnd < skeletonSize.timeline.width) {
      drawRect(minisEnd, skeletonSize.timeline.y - 1, MINI_SIZE, MINI_SIZE + 2);
    }
  }
}
