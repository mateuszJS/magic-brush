import "./styles/index.scss";
import initWebGL2 from "utils/WebGL/initWebGL2";
import { compilePrograms } from "programs";
import Video from "models/Video";
import Timeline from "Timeline";
import Preview from "Preview";
import { initUI } from "UI";
import { initCanvasMatrix } from "programs/canvasMatrix";
import resizeCanvas from "utils/resizeCanvas";
import setupRenderTarget from "renders/setupRenderTarget";

// tips form mozilla! https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices

interface SnowEffect {}

export class GlobState {
  public snow: SnowEffect | null;
  public currTime: number;
  public videoUrl: string | null;
  public needsRefreshPreview: boolean; // indicates if we should make an update or not
  public needsRefreshTimeline: boolean; // indicates if we should make an update or not

  constructor() {
    this.snow = null;
    this.currTime = 0;
    this.videoUrl = null;
    this.needsRefreshPreview = true;
    this.needsRefreshTimeline = true;
  }

  public refresh() {
    this.refreshPreview();
    this.refreshTimeline();
  }

  public refreshPreview() {
    this.needsRefreshPreview = true;
  }

  public refreshTimeline() {
    this.needsRefreshTimeline = true;
  }

  public afterUpdate() {
    this.needsRefreshTimeline = false;
    this.needsRefreshPreview = false;
  }
}

const globalState = new GlobState();

export function addVideo(file: File) {
  globalState.videoUrl = URL.createObjectURL(file);
  globalState.refresh();
  // para.textContent = `File name ${file.name}, file size ${returnFileSize(file.size)}.`;
}

export default function initApp() {
  initUI();
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
  initCanvasMatrix();
  const preview = new Preview(globalState);
  const timeline = new Timeline(globalState);
  setupRenderTarget(window.gl, null);
  // update needs to be true once video is loaded and available - MAYBE, probably not
  function draw(now: DOMHighResTimeStamp) {
    // we should call draw ONLY when we have some update in globState
    // on resize we can do draw also
    if (globalState.needsRefreshTimeline) {
      // STATE.currTime = (STATE.currTime + 1) % STATE.video.duration;
      timeline.render();
    }
    globalState.afterUpdate();
    requestAnimationFrame(draw);
    // Tell it to use our program (pair of shaders)
  }
  requestAnimationFrame(draw);
}
