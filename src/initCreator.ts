import "./styles/index.scss";
// import Preview from "Preview";
import { initUI, subscribeTimelineScroll, updateTimelineWidth } from "UI";
import { initCanvasMatrix } from "programs/canvasMatrix";
import resizeCanvas from "utils/resizeCanvas";
import setupRenderTarget from "renders/setupRenderTarget";
import { MS_PER_PIXEL } from "consts";
import Timeline from "Timeline";
import MiniatureVideo from "models/Video/MiniatureVideo";
import Preview from "Preview";

// tips form mozilla! https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices

interface SnowEffect {}

export class State {
  public snow: SnowEffect | null;
  public currTime: number;
  public needsRefresh: boolean; // indicates if we should make an update or not
  public video: MiniatureVideo;

  constructor(videoUrl: string, onVideoLoaded: (state: State) => void) {
    this.snow = null;
    this.currTime = 0;
    this.needsRefresh = true;

    this.video = new MiniatureVideo(
      videoUrl,
      (video) => {
        const width = video.duration / MS_PER_PIXEL;
        updateTimelineWidth(width);
        onVideoLoaded(this);
        this.refresh();
      },
      () => this.currTime
    );
  }

  public refresh() {
    this.needsRefresh = true;
  }
}

function runCreator(state: State) {
  const preview = new Preview(state.video.width, state.video.height);
  const timeline = new Timeline(
    state.video.duration,
    state.video.width,
    state.video.height
  );

  function draw(now: DOMHighResTimeStamp) {
    const { needsRefresh } = state;
    state.needsRefresh = false;

    if (needsRefresh) {
      preview.render(state);
      timeline.render(state);
    }
    requestAnimationFrame(draw);
    // Tell it to use our program (pair of shaders)
  }

  requestAnimationFrame(draw);
}

export default function initCreator(videoUrl: string) {
  const state = new State(videoUrl, runCreator);
  initUI();
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
  initCanvasMatrix();

  subscribeTimelineScroll((scroll) => {
    state.currTime = scroll * MS_PER_PIXEL;
    state.refresh();
  });
}
