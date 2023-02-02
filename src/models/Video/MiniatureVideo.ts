import Texture from "models/Texture";
import AbstractVideo from "./AbstractVideo";
import { MINIATURE_SIZE } from "consts";
import { drawSprite } from "programs";
import { getMiniatureTexCoords } from "Timeline";
import renderSprite from "renders/renderSprite";
import FrameBuffer from "models/FrameBuffer";
import setupRenderTarget from "renders/setupRenderTarget";
import m3 from "utils/m3";

const PLACEHOLDER_TEX_SIZE = 1;

export default class MiniatureVideo extends AbstractVideo {
  private requestedFrames: {
    time: number;
    callback: VoidFunction;
    texture: Texture;
    isFetching: boolean;
  }[]; // includes times
  private textureCache: Map<number, Texture>;
  private copyTexture: Texture;
  private copyFBO: FrameBuffer;
  private vao: WebGLVertexArrayObject | null;
  private projMatrix: Matrix3;

  constructor(
    url: string,
    cbOnReady: (duration: number) => void,
    private getCurrTime: () => number
  ) {
    super(url, (duration) => {
      const texCoords = new Float32Array(
        getMiniatureTexCoords(this.width, this.height)
      );
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

      this.vao = drawSprite.createVAO(texCoords, positions, indexes);

      cbOnReady(duration);
    });

    this.requestedFrames = [];
    this.textureCache = new Map();
    this.copyTexture = new Texture();
    this.copyFBO = new FrameBuffer();

    this.vao = null;

    this.projMatrix = m3.projection(MINIATURE_SIZE, MINIATURE_SIZE);
  }

  private fetchAnotherRequestedFrame() {
    const start = performance.now();
    const currTime = this.getCurrTime();

    const frameDetails = this.requestedFrames.reduce((accFrame, frame) => {
      if (
        Math.abs(frame.time - currTime) < Math.abs(accFrame.time - currTime)
      ) {
        return frame;
      }
      return accFrame;
    });

    const html = this.html;
    html.currentTime = Math.max(1, frameDetails.time) / 1000; // requestVideoFrameCallback won't fire if initial offset is zero! Or maybe if it didn't changed....
    frameDetails.isFetching = true;
    // https://web.dev/requestvideoframecallback-rvfc/

    html.requestVideoFrameCallback((now, metadata) => {
      // metadata.presentedFrames - number of frames submitted for composition since last requestVideoFrameCallback, usually is 1.
      // metadata.mediaTime - like video.currentTime, in seconds

      const end = performance.now();
      // console.log("performance", end - start);
      this.requestedFrames = this.requestedFrames.filter(
        (frame) => frame.time !== frameDetails.time
      );

      // catch current video frame in a texture
      this.copyTexture.fill({
        html: this.html,
        width: this.width,
        height: this.height,
      });

      // render texture from previous step to frame buffer with the size of miniature
      this.copyFBO.resize(MINIATURE_SIZE, MINIATURE_SIZE);
      if (!this.vao) {
        throw Error(
          "VAO was nto created yet! It's created once the video is ready."
        );
      }
      drawSprite.setup(this.vao, this.copyTexture.bind(0), this.projMatrix);

      setupRenderTarget(this.copyFBO);
      renderSprite(); // should scream if setupRenderTarget was not called after last render, it may be an issue
      // also should throw an error if matrix was not updated, and we are not rendering to canvas with canvas matrix
      // maybe there is some webgl 2 methods which can make ti easier?
      // fix length of the timeline
      // some miniatures are missing while scrolling fast

      /* COPY PIXELS FROM CURRENT FRAME BUFFER INTO TEXTURE */
      frameDetails.texture.fill(this.copyFBO);

      frameDetails.callback();

      if (this.requestedFrames.length > 0) {
        this.fetchAnotherRequestedFrame();
      }
    });
  }

  private getFrame(msOffset: number, callback: VoidFunction, texture: Texture) {
    const alreadyExists = this.requestedFrames.some(
      (frame) => frame.time === msOffset
    );

    if (alreadyExists) return;

    const isQueueEmpty = this.requestedFrames.length === 0;
    this.requestedFrames.push({
      time: msOffset,
      callback,
      texture,
      isFetching: false,
    });

    if (isQueueEmpty) {
      this.fetchAnotherRequestedFrame();
    }
  }

  public getMiniature(msOffset: number, callback: VoidFunction) {
    let tex = this.textureCache.get(msOffset);

    if (!tex) {
      tex = new Texture();
      tex.fill({
        width: PLACEHOLDER_TEX_SIZE,
        height: PLACEHOLDER_TEX_SIZE,
        color: [0, 1, 0, 1],
      });
      this.textureCache.set(msOffset, tex);
    }

    if (tex.width === PLACEHOLDER_TEX_SIZE) {
      this.getFrame(msOffset, callback, tex);
    }

    return tex;
  }

  public clearRequestsList() {
    this.requestedFrames = this.requestedFrames.filter(
      (frame) => !frame.isFetching
    );
  }
}
