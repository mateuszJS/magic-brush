export default class AbstractVideo {
  private _width?: number;
  private _height?: number;
  private _duration?: number;
  public html: HTMLVideoElement;
  public isReady: boolean;

  constructor(private url: string, cbOnReady: (duration: number) => void) {
    const html = document.createElement("video");
    this.isReady = false;

    html.addEventListener("loadedmetadata", () => {
      this.isReady = true;
      this._width = html.videoWidth;
      this._height = html.videoHeight;
      this._duration = html.duration * 1000;
      // startDate - Returns a Date object representing the current time offset
      cbOnReady(this._duration);
    });

    html.playsInline = true;
    html.muted = true;
    html.loop = true;
    html.src = this.url;
    html.preload = "auto";

    this.html = html;
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
}
