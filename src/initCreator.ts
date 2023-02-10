import "./styles/index.scss";
import { initUI, updateTimelineScroll, updateTimelineWidth } from "UI";
import { calcMatrix } from "programs/canvasMatrix";
import resizeCanvas from "utils/resizeCanvas";
import { MS_PER_PIXEL } from "consts";
import Timeline from "Timeline";
import MiniatureVideo from "models/Video/MiniatureVideo";
import Preview from "Preview";
import { updateToolbar } from "UI/createToolbar";
import Effects from "Effects";

interface SnowEffect {
  curve: Point[];
}

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

  public updateCurrTime = (time: number) => {
    this.currTime = time;
    this.refresh();
  };

  public brushMode = () => {
    this.pauseVideo();
    this.snow = {
      curve: [
        { id: 1, x: 100, y: 100 },
        { id: 2, x: 100, y: 150 },
        { id: 3, x: 400, y: 100 },
        { id: 4, x: 300, y: 150 },
      ],
    };
  };
}

function runCreator(state: State) {
  const preview = new Preview(state.video.width, state.video.height);
  const timeline = new Timeline(
    state.video.duration,
    state.video.width,
    state.video.height
  );
  const effect = new Effects();

  function draw(now: DOMHighResTimeStamp) {
    const { needsRefresh } = state;
    state.needsRefresh = false;

    if (state.video.isPlaying) {
      state.updateCurrTime(state.video.currTime);
      updateTimelineScroll(state);
      /*
        1. we update scroll position
        2. It imitates user interaction, so event for changing scroll is fired
        3. That scroll event update currTime and refresh in the state
      */
    }

    if (needsRefresh) {
      preview.render(state);
      effect.render(state);
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
  initUI(state); // UI initialize skeletonSize, what has to be calculated AFTER setting --vh variable in css to make measurements correctly
}
