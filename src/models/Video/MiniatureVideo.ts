import Texture from "models/Texture";
import AbstractVideo from "./AbstractVideo";
import { MINIATURE_SIZE, MS_PER_PIXEL } from "consts";

const PLACEHOLDER_TEX_SIZE = 1;

const gl = window.gl;

const getDepthFromTime = (timeMs: number) =>
  Math.ceil(timeMs / MS_PER_PIXEL / MINIATURE_SIZE);

export default class MiniatureVideo extends AbstractVideo {
  private requestedFrames: {
    time: number;
    callback: VoidFunction;
    isFetching: boolean;
  }[]; // includes times
  public textureAtlas: WebGLTexture;
  private fetchedFramesMs: number[];

  constructor(
    url: string,
    cbOnReady: (video: MiniatureVideo) => void,
    private getCurrTime: () => number
  ) {
    super(url, (duration) => {
      cbOnReady(this);

      const texture = gl.createTexture();
      if (!texture) throw Error("NO TEXTURE");
      gl.bindTexture(gl.TEXTURE_2D_ARRAY, texture);
      const numberOfMiniatures = getDepthFromTime(duration);
      console.log("depth", numberOfMiniatures);
      gl.texStorage3D(
        gl.TEXTURE_2D_ARRAY,
        1, // its not he level, it's the number of levels, you always have at least one
        gl.RGBA8,
        this.width,
        this.height,
        numberOfMiniatures
      ); // allocating space in the GPU
      gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

      this.textureAtlas = texture;
    });

    this.textureAtlas = new Texture();
    this.requestedFrames = [];
    this.fetchedFramesMs = [];
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

      this.fetchedFramesMs.push(frameDetails.time);

      const end = performance.now();
      // console.log("performance", end - start);
      this.requestedFrames = this.requestedFrames.filter(
        (frame) => frame.time !== frameDetails.time
      );

      const zOffset = getDepthFromTime(frameDetails.time);
      gl.bindTexture(gl.TEXTURE_2D_ARRAY, this.textureAtlas);
      gl.texSubImage3D(
        gl.TEXTURE_2D_ARRAY,
        0,
        0,
        0,
        zOffset,
        this.width,
        this.height,
        1,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        html
      );

      /* COPY PIXELS FROM CURRENT FRAME BUFFER INTO TEXTURE */
      // frameDetails.texture.fill(this.copyFBO);

      frameDetails.callback();

      if (this.requestedFrames.length > 0) {
        this.fetchAnotherRequestedFrame();
      }
    });
  }

  private getFrame(msOffset: number, callback: VoidFunction) {
    const alreadyExists = this.requestedFrames.some(
      (frame) => frame.time === msOffset
    );

    if (alreadyExists) return;

    this.requestedFrames.push({
      time: msOffset,
      callback,
      isFetching: false,
    });

    if (this.requestedFrames.length === 1) {
      // so it's an item that we just pushed
      this.fetchAnotherRequestedFrame();
    }
  }

  public getMiniature(msOffset: number, callback: VoidFunction) {
    if (!this.fetchedFramesMs.includes(msOffset)) {
      this.getFrame(msOffset, callback);
    }
  }

  public clearRequestsList() {
    this.requestedFrames = this.requestedFrames.filter(
      (frame) => !frame.isFetching
    );
  }
}
