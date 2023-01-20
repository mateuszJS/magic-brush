import { GlobState } from "initApp";
import Texture from "models/Texture";
import Video from "models/Video";
import { drawSprite } from "programs";
import renderSprite from "renders/renderSprite";
import setupRenderTarget from "renders/setupRenderTarget";
import initWebGL2 from "utils/WebGL/initWebGL2";
import m3 from "utils/m3";
import { skeletonSize, subscribeTimelineScroll, updateTimelineWidth } from "UI";

const MINIATURE_SIZE = 100;
const MS_PER_PIXEL = 5;
const MS_PER_MINIATURE = MS_PER_PIXEL * MINIATURE_SIZE;

export default class Timeline {
  private zoom: number;
  private lastTime: number;
  private textureCache: Map<number, Texture>;
  private video: Video | null;

  constructor(private globStateRef: GlobState) {
    this.zoom = 1; // how zoomed is timeline
    this.lastTime = NaN;
    this.textureCache = new Map();

    subscribeTimelineScroll((scroll) => {
      globStateRef.currTime = scroll * MS_PER_PIXEL;
      globStateRef.refresh();
    });
    this.video = null;
    // on resize it should update
  }

  private renderTexture(texture: Texture, posIndex: number) {
    drawSprite.setup({
      position: this.getMiniaturePosition(posIndex),
      texCoord: this.getMiniatureTexCoords(texture),
      texUnitIndex: texture.bind(0),
    });
    renderSprite();
  }

  private getTexture(video: Video, time: number, index: number): Texture {
    // TODO: checkout it https://developer.mozilla.org/en-US/docs/Web/API/VideoFrame
    // it's VideoFrame object

    // also checkout requestVideoFrameCallback
    // https://web.dev/requestvideoframecallback-rvfc/

    // some discussion why frame accurate player is impossible to implement
    // https://github.com/w3c/media-and-entertainment/issues/4

    // setupRenderTarget(gl, null);
    // setupRenderTarget(gl, null, [0.7, 0.7, 0.7, 1]);

    if (this.textureCache.has(time)) {
      return this.textureCache.get(time) as Texture;
    } else {
      const texture = new Texture();
      texture.fill({ width: MINIATURE_SIZE, height: MINIATURE_SIZE });
      this.textureCache.set(time, texture);

      const onFetchFrame = (
        time: number,
        renderedFrames: number,
        currentTime: number
      ) => {
        // console.log(time, renderedFrames, currentTime);
        // Probably we don't need request animation frame, although ti should always call after requestingVideoFrame so...
        texture.fill({
          // TODO: it would be cool to fill texture with square, and make texture size as miniature!
          // all textures also should be in a object, key as the second and texture as the value
          html: video.html,
          width: video.width,
          height: video.height,
        });
        this.globStateRef.refreshTimeline(); // to render next frame in a queue
      };
      // console.log(this.globStateRef.currTime + MS_PER_MINIATURE * index);
      video.getFrame(
        this.globStateRef.currTime + MS_PER_MINIATURE * index,
        onFetchFrame
      );

      return texture;
    }

    // requestAnimationFrame(draw);
    // Tell it to use our program (pair of shaders)
  }

  private getMiniatureTexCoords(texture: Texture) {
    const offsetY = ((texture.aspect - 1) * 0.5) / texture.aspect;

    return new Float32Array([
      0,
      offsetY,
      0,
      1 - offsetY,
      1,
      1 - offsetY,
      1,
      offsetY,
    ]);
  }

  private getStartX(index: number) {
    const skeleton = skeletonSize.timeline;
    return (
      skeleton.x +
      skeleton.width / 2 +
      index * MINIATURE_SIZE -
      this.globStateRef.currTime / MS_PER_PIXEL
    );
  }

  private getMiniaturePosition(index: number) {
    const video = this.video;
    if (!video) {
      throw Error("There is no video initialized yet!");
    }

    const startX = this.getStartX(index);
    const skeleton = skeletonSize.timeline;
    const width =
      (index + 1) * MINIATURE_SIZE > video.duration / MS_PER_PIXEL
        ? (video.duration / MS_PER_PIXEL) % MINIATURE_SIZE
        : MINIATURE_SIZE; // TODO: it shouldn't scale the texture, it should cut the texture

    return new Float32Array([
      startX,
      skeleton.y,
      startX,
      skeleton.y + MINIATURE_SIZE,
      startX + width,
      skeleton.y + MINIATURE_SIZE,
      startX + width,
      skeleton.y,
    ]);
  }

  render() {
    if (!this.video) {
      if (this.globStateRef.videoUrl) {
        const video = new Video(this.globStateRef.videoUrl, () => {
          this.globStateRef.refreshTimeline();
          const width = video.duration / MS_PER_PIXEL;
          updateTimelineWidth(width);
          console.log(
            width,
            Math.ceil(video.duration / MS_PER_PIXEL / MINIATURE_SIZE)
          );
        });
        this.video = video;
        // we need to add more frames, and make them easier to cache and reuse from cache!
      }
      return; // we can skip further rendering
      // we have video, but video.isReady = false
    }

    const video = this.video;

    if (!video.isReady) return;

    /* drawing video miniatures */
    const length = Math.ceil(video.duration / MS_PER_PIXEL / MINIATURE_SIZE);
    // TODO: request and display only those visible!

    for (let i = 0; i < length; i++) {
      const time = i * MS_PER_MINIATURE;
      const texture = this.getTexture(video, time, i);
      this.renderTexture(texture, i);
      // const time = currTime + i * MS_PER_MINIATURE // THIS IS CORRECT
    }
  }
}
