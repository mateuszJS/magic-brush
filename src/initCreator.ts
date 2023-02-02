import "./styles/index.scss";
import Preview from "Preview";
import { initUI, subscribeTimelineScroll, updateTimelineWidth } from "UI";
import { initCanvasMatrix } from "programs/canvasMatrix";
import resizeCanvas from "utils/resizeCanvas";
import setupRenderTarget from "renders/setupRenderTarget";
import { MS_PER_PIXEL } from "consts";
import Timeline from "Timeline";

// tips form mozilla! https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices

interface SnowEffect {}

export class State {
  public snow: SnowEffect | null;
  public currTime: number;
  public needsRefresh: boolean; // indicates if we should make an update or not

  constructor() {
    this.snow = null;
    this.currTime = 0;
    this.needsRefresh = true;
  }

  public refresh() {
    this.needsRefresh = true;
  }
}

export default function initCreator(videoUrl: string) {
  const state = new State();
  initUI();
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
  initCanvasMatrix();
  const preview = new Preview(videoUrl, state);
  const timeline = new Timeline(videoUrl, state);

  subscribeTimelineScroll((scroll) => {
    state.currTime = scroll * MS_PER_PIXEL;
    state.refresh();
  });

  setupRenderTarget(null);
  // update needs to be true once video is loaded and available - MAYBE, probably not
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
