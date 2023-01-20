type FetchFrameCallback = (
  time: number,
  renderedFrames: number,
  currentTime: number
) => void;

export default class Video {
  private _width?: number;
  private _height?: number;
  private _duration?: number;
  private requestedFrames: { time: number; callback: FetchFrameCallback }[]; // includes times
  public html: HTMLVideoElement;
  public isReady: boolean;

  constructor(private url: string, cbOnReady: VoidFunction) {
    const html = document.createElement("video");
    this.isReady = false;

    html.addEventListener("loadedmetadata", () => {
      this.isReady = true;
      this._width = html.videoWidth;
      this._height = html.videoHeight;
      this._duration = html.duration * 1000;
      // startDate - Returns a Date object representing the current time offset
      cbOnReady();
    });

    html.playsInline = true;
    html.muted = true;
    html.loop = true;
    html.src = this.url;

    this.html = html;

    this.requestedFrames = [];
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

  /*
    private static getVideoFrame(video: HTMLVideoElement, context: CanvasRenderingContext2D, time: number): Promise<ImageData> {
    return new Promise((resolve: (frame: ImageData) => void, reject: (error: string) => void) => {
      let eventCallback = () => {
        video.removeEventListener('seeked', eventCallback);
        this.storeFrame(video, context, resolve);
      };
      video.addEventListener('seeked', eventCallback);
      video.currentTime = time;
    });
  }
  */

  private fetchAnotherRequestedFrame() {
    const frameDetails = this.requestedFrames[0];
    const html = this.html;
    html.currentTime = Math.max(1, frameDetails.time) / 1000; // requestVideoFrameCallback won't fire if initial offset is zero! Or maybe if it didn't changed....

    // https://web.dev/requestvideoframecallback-rvfc/

    // I didn't get the zero frame!
    html.requestVideoFrameCallback((now, metadata) => {
      this.requestedFrames.splice(0, 1);

      // metadata.presentedFrames - number of frames submitted for composition since last requestVideoFrameCallback, usually is 1.
      // metadata.mediaTime - like video.currentTime, in seconds
      frameDetails.callback(now, metadata.presentedFrames, metadata.mediaTime);

      if (this.requestedFrames.length > 0) {
        this.fetchAnotherRequestedFrame();
      }
    });
  }

  public getFrame(msOffset: number, callback: FetchFrameCallback) {
    const isQueueEmpty = this.requestedFrames.length === 0;
    this.requestedFrames.push({ time: msOffset, callback });

    if (isQueueEmpty) {
      this.fetchAnotherRequestedFrame();
    }
  }
}
