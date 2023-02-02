import { MINIATURE_SIZE, MS_PER_PIXEL } from "consts";
import { State } from "initCreator";
import Texture from "models/Texture";
import MiniatureVideo from "models/Video/MiniatureVideo";
import { drawSprite } from "programs";
import { canvasMatrix } from "programs/canvasMatrix";
import renderSprite from "renders/renderSprite";
import setupRenderTarget from "renders/setupRenderTarget";
import { skeletonSize, updateTimelineWidth } from "UI";
import m3 from "utils/m3";

const MS_PER_MINIATURE = MS_PER_PIXEL * MINIATURE_SIZE;

const texCoords = new Float32Array([0, 0, 0, 1, 1, 1, 1, 0]);
const positions = new Float32Array([
  0,
  0,
  0,
  MINIATURE_SIZE,
  MINIATURE_SIZE,
  MINIATURE_SIZE,
  MINIATURE_SIZE,
  0,
]);
const indexes = new Uint16Array([0, 1, 2, 0, 2, 3]);
const vao = drawSprite.createVAO(texCoords, positions, indexes);

function renderTexture(
  texture: Texture,
  index: number,
  startX: number,
  video: MiniatureVideo
) {
  const x = startX + index * MINIATURE_SIZE;
  drawSprite.setup(
    vao,
    texture.bind(0),
    m3.translate(canvasMatrix, x, skeletonSize.timeline.y)
  );
  setupRenderTarget(null);
  renderSprite();
}

export function getMiniatureTexCoords(width: number, height: number) {
  const offsetY = (Math.max(0, height - width) * 0.5) / height;
  const offsetX = (Math.max(0, width - height) * 0.5) / width;

  return new Float32Array([
    offsetX,
    offsetY,
    offsetX,
    1 - offsetY,
    1 - offsetX,
    1 - offsetY,
    1 - offsetX,
    offsetY,
  ]);
}

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
  private video: MiniatureVideo;

  constructor(videoUrl: string, state: State) {
    this.video = new MiniatureVideo(
      videoUrl,
      (duration) => {
        const width = duration / MS_PER_PIXEL;
        updateTimelineWidth(width);
        state.refresh();
      },
      () => state.currTime
    );
  }

  render(state: State) {
    // TODO: those miniatures still look like are stretched vertically too much
    if (!this.video.isReady) return;
    const start = performance.now();
    const startX = getStartX(state.currTime);
    const startTime = getStartTime(state.currTime);
    const length = getMiniaturesNumber(startTime, this.video);

    for (let i = 0; i < length; i++) {
      const time = startTime + i * MS_PER_MINIATURE;
      const texture = this.video.getMiniature(time, () => state.refresh()); // DO NOT pass state.refresh as a param. "this" will be messed up inside refresh function
      renderTexture(texture, i, startX, this.video);
      // const time = currTime + i * MS_PER_MINIATURE // THIS IS CORRECT
    }

    const end = performance.now();
    avgValue += end - start;
    avgNumber++;

    if (avgNumber % 60 === 0) {
      console.log("avg", avgValue / avgNumber);
    }

    const gl = window.gl;
    gl.enable(gl.SCISSOR_TEST);
    gl.scissor(
      startX +
        (length - 1) * MINIATURE_SIZE +
        (((this.video.duration - startTime) / MS_PER_PIXEL) % MINIATURE_SIZE),
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
