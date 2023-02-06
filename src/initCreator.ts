import "./styles/index.scss";
import { initUI, subscribeTimelineScroll, updateTimelineWidth } from "UI";
import { calcMatrix } from "programs/canvasMatrix";
import resizeCanvas from "utils/resizeCanvas";
import { MS_PER_PIXEL } from "consts";
import Timeline from "Timeline";
import MiniatureVideo from "models/Video/MiniatureVideo";
import Preview from "Preview";

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

function onResize() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
  resizeCanvas(); // remember to always firstly setup --vh in css
  calcMatrix(); // remember to firstly set size of canvas!
}

export default function initCreator(videoUrl: string) {
  const state = new State(videoUrl, runCreator);
  onResize();
  window.addEventListener("resize", onResize);
  initUI(); // UI initialize skeletonSize, what has to be calculated AFTER setting --vh variable in css to make measurements correctly
  subscribeTimelineScroll((scroll) => {
    state.currTime = scroll * MS_PER_PIXEL;
    state.refresh();
  });
}
