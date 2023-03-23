import MiniatureVideo from "models/Video/MiniatureVideo";
import { updateToolbar } from "UI/createToolbar";
import { splitFloatIntoVec3 } from "utils/id";
import { MS_PER_PIXEL } from "consts";
import { updateTimelineScroll, updateTimelineWidth } from "UI";

interface HandlePoint {
  id: number;
  idVec4: vec4;
  x: number;
  y: number;
}

interface SnowEffect {
  curve: HandlePoint[];
}

export default class State {
  public snow: SnowEffect | null;
  public currTime: number;
  public needsRefresh: boolean; // indicates if we should make an update or not
  public video: MiniatureVideo;
  // related to mouse interactions
  public needsRefreshSelection: boolean;
  private mouseOffsetX: number;
  private mouseOffsetY: number;
  public testSelection: (state: State, x: number, y: number) => number;
  public selectedHandler: HandlePoint | null;

  constructor(videoUrl: string, onVideoLoaded: (state: State) => void) {
    this.snow = null;
    this.currTime = 0;
    this.needsRefresh = true;
    this.needsRefreshSelection = false;
    this.selectedHandler = null;
    this.mouseOffsetX = 0;
    this.mouseOffsetY = 0;
    this.testSelection = () => 0; // just fake function, placeholder

    const onLoadVideo = (video: MiniatureVideo) => {
      onVideoLoaded(this);
      this.refresh();
      const updateUIresize = () => {
        const width = video.duration / MS_PER_PIXEL;
        updateTimelineWidth(width);
        updateTimelineScroll(this);
      };
      window.addEventListener("resize", updateUIresize);
      updateUIresize();
    };

    this.video = new MiniatureVideo(
      videoUrl,
      onLoadVideo,
      () => this.currTime,
      this.pauseVideo
    );
  }

  public onPointerDown = (x: number, y: number) => {
    const newSelectionId = this.testSelection(this, x, y);
    const newSelectedHandler = this.snow?.curve.find(
      (point) => point.id === newSelectionId
    );

    if (newSelectedHandler) {
      this.selectedHandler = newSelectedHandler;
      this.mouseOffsetX = newSelectedHandler.x - x;
      this.mouseOffsetY = newSelectedHandler.y - y;
      this.refresh();
    }
  };

  public onPointerUp = () => {
    this.selectedHandler = null;
    this.refresh();
  };

  public onPointerMove = (x: number, y: number) => {
    const handler = this.selectedHandler;
    if (handler) {
      handler.x = this.mouseOffsetX + x;
      handler.y = this.mouseOffsetY + y;
      this.refresh();
    }
  };

  public playVideo = () => {
    this.video.play(this.currTime);
    updateToolbar(this);
  };

  public pauseVideo = () => {
    this.video.pause();
    updateToolbar(this);
    this.refresh();
  };

  public refresh = () => {
    this.needsRefresh = true;
  };

  private addHandle(id: number, x: number, y: number) {
    this.snow?.curve.push({
      id,
      idVec4: splitFloatIntoVec3(id),
      x,
      y,
    });
  }

  public brushMode = () => {
    this.pauseVideo();
    this.snow = {
      curve: [],
    };
    this.addHandle(1, 50, 200);
    this.addHandle(2, 100, 130);
    this.addHandle(3, 400, 100);
    this.addHandle(4, 450, 200);
  };
}
