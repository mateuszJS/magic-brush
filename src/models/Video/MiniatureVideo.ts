import Texture from "models/Texture";
import { MINI_SIZE, MS_PER_PIXEL, isMobile } from "consts";

const PLACEHOLDER_TEX_SIZE = 1;

const gl = window.gl;

const getDepthFromTime = (timeMs: number) =>
  Math.ceil(timeMs / MS_PER_PIXEL / MINI_SIZE);
let avgNumber = 0;
let avgValue = 0;
export default class MiniatureVideo {
  private _width?: number;
  private _height?: number;
  private _duration?: number;
  public html: HTMLVideoElement;
  public isReady: boolean;
  private requestedFrames: {
    time: number;
    callback: VoidFunction;
    isFetching: boolean;
    cache: boolean;
  }[]; // includes times
  public textureAtlas: WebGLTexture;
  private fetchedFramesMs: number[];
  public isPlaying: boolean;
  public sourceReady: boolean; // indicates if first frame is available while playing video(we don't want to render a frame right after updating video time, video will still contain last rendered frame)

  constructor(
    url: string,
    cbOnReady: (video: MiniatureVideo) => void,
    private getCurrTime: () => number
  ) {
    const html = document.createElement("video");
    this.isReady = false;

    html.addEventListener("loadedmetadata", () => {
      this.isReady = true;
      this._width = html.videoWidth;
      this._height = html.videoHeight;
      this._duration = html.duration * 1000;
      // startDate - Returns a Date object representing the current time offset

      const texture = gl.createTexture();
      if (!texture) throw Error("NO TEXTURE");
      gl.bindTexture(gl.TEXTURE_2D_ARRAY, texture);
      const numberOfMiniatures = getDepthFromTime(this.duration);
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

      if (isMobile) {
        // fix, On mobile the event from requestVideoFrameCallback is not firing! Needs to call play() at least once
        this.html.play();
        this.html.pause();
      }

      cbOnReady(this);
    });

    html.playsInline = true;
    html.muted = true;
    html.loop = false;
    html.src = url;
    html.preload = "auto";
    // TODO: test the performance
    html.preload = "none";

    this.html = html;

    this.textureAtlas = new Texture();
    this.requestedFrames = [];
    this.fetchedFramesMs = [];
    this.isPlaying = false;
    this.sourceReady = false;

    this.html.addEventListener("ended", this.pause);
  }

  set currTime(time: number) {
    this.html.currentTime = time / 1000;
  }

  get currTime() {
    return this.html.currentTime * 1000;
  }

  // returns duration of the video in ms
  get duration() {
    if (!this._duration) {
      throw Error(
        "Duration of the video is unknown! Wait for meta data to be loaded!"
      );
    }

    return this._duration;
  }

  get width() {
    if (!this._width) {
      throw Error(
        "Width of the video is unknown! Wait for meta data to be loaded!"
      );
    }

    return this._width;
  }

  get height() {
    if (!this._height) {
      throw Error(
        "Height of the video is unknown! Wait for meta data to be loaded!"
      );
    }

    return this._height;
  }

  private getVideoData() {
    const tmpCanvas = document.createElement("canvas");
    // TODO: maybe we can decrease the size! I think we can!
    // decrease to min required by the screen OR to video size(if is smaller than screen)
    tmpCanvas.width = this.html.videoWidth;
    tmpCanvas.height = this.html.videoHeight;
    const ctx = tmpCanvas.getContext("2d");
    if (!ctx) throw Error("NO 2D CONTEXT FOR TEMPORAL CANVAS");
    ctx.drawImage(this.html, 0, 0);
    return ctx.getImageData(0, 0, this.html.videoWidth, this.html.videoHeight)
      .data;
  }

  private fetchNextFrame() {
    const currTime = this.getCurrTime();

    const frameDetails = this.requestedFrames.reduce((accFrame, frame) => {
      if (
        Math.abs(frame.time - currTime) < Math.abs(accFrame.time - currTime)
      ) {
        return frame;
      }
      return accFrame;
    });

    this.currTime = Math.max(1, frameDetails.time); // requestVideoFrameCallback won't fire if initial offset is zero! Or maybe if it didn't changed....
    frameDetails.isFetching = true;
    // https://web.dev/requestvideoframecallback-rvfc/

    this.html.requestVideoFrameCallback((now, metadata) => {
      // metadata.presentedFrames - number of frames submitted for composition since last requestVideoFrameCallback, usually is 1.
      // metadata.mediaTime - like video.currentTime, in seconds

      if (this.isPlaying) {
        frameDetails.isFetching = false;
        return; // we don't want to complicate code by
        // implementing canceling the requestVideoFrameCallback once video start playing, so
        // we will just avoid the effect of requestVideoFrameCallback
      }

      this.requestedFrames = this.requestedFrames.filter(
        (frame) => frame.time !== frameDetails.time
      );

      if (frameDetails.cache) {
        const start = performance.now();
        this.fetchedFramesMs.push(frameDetails.time);

        const zOffset = getDepthFromTime(frameDetails.time); // make sure it's <0. Safari thrown error that sometimes it is less than 0
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
          gl.RGBA, // try to use jsut RGB
          gl.UNSIGNED_BYTE,
          this.html
        );
        //208.6079999923706 - with pixel buffer, now it's 199.1639999997616
        //124.86400000691414  reading from raw video
        const end = performance.now();
        avgValue += end - start;
        avgNumber++;

        // console.log("avg", avgValue / avgNumber);
      }

      /* COPY PIXELS FROM CURRENT FRAME BUFFER INTO TEXTURE */
      // frameDetails.texture.fill(this.copyFBO);

      frameDetails.callback();

      if (this.requestedFrames.length > 0) {
        this.fetchNextFrame();
      }
    });
  }

  private addFrameToQueue(
    msOffset: number,
    callback: VoidFunction,
    cache: boolean
  ) {
    const alreadyExists = this.requestedFrames.some(
      (frame) => frame.time === msOffset
    );

    if (alreadyExists) return;

    this.requestedFrames.push({
      time: msOffset,
      callback,
      isFetching: false,
      cache,
    });

    const isAnyDuringFetch = this.requestedFrames.some(
      (frame) => frame.isFetching
    );
    if (!isAnyDuringFetch) {
      this.fetchNextFrame();
    }
  }

  public requestFrame(
    msOffset: number,
    callback: VoidFunction,
    cache: boolean
  ) {
    if (this.isPlaying) return; // when video is playing we don't want to disrupt it with changing currentTime

    if (!this.fetchedFramesMs.includes(msOffset)) {
      this.addFrameToQueue(msOffset, callback, cache);
    }
  }

  public clearRequestsList() {
    this.requestedFrames = this.requestedFrames.filter(
      (frame) => !frame.isFetching
    );
  }

  public play(time: number) {
    this.currTime = time;
    this.html.play();
    this.isPlaying = true;

    this.html.requestVideoFrameCallback(() => {
      this.sourceReady = true;
    });
  }

  public pause = () => {
    this.html.pause();
    this.isPlaying = false;
    this.sourceReady = false;
  };
}
