import "./styles/index.scss";
import { initUI, updateTimelineScroll, updateTimelineWidth } from "UI";
import { calcMatrix } from "programs/canvasMatrix";
import resizeCanvas from "utils/resizeCanvas";
import { MS_PER_PIXEL } from "consts";
import Timeline from "Timeline";
import MiniatureVideo from "models/Video/MiniatureVideo";
import Preview from "Preview";
import { updateToolbar } from "UI/createToolbar";
import Handles from "Handles";
import { splitFloatIntoVec3 } from "utils/id";
import Effects from "Effects";

interface HandlePoint {
  id: number;
  idVec4: vec4;
  x: number;
  y: number;
}

interface SnowEffect {
  curve: HandlePoint[];
}

export class State {
  public snow: SnowEffect | null;
  public currTime: number;
  public needsRefresh: boolean; // indicates if we should make an update or not
  public video: MiniatureVideo;
  // related to mouse interactions
  public mouseX: number;
  public mouseY: number;
  public needsRefreshSelection: boolean;
  public selectionId: number;
  public drag: boolean;
  private mouseOffsetX: number;
  private mouseOffsetY: number;

  constructor(videoUrl: string, onVideoLoaded: (state: State) => void) {
    this.snow = null;
    this.currTime = 0;
    this.needsRefresh = true;

    this.mouseX = 0;
    this.mouseY = 0;
    this.needsRefreshSelection = false;
    this.selectionId = 0;
    this.drag = false;
    this.mouseOffsetX = 0;
    this.mouseOffsetY = 0;

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

    this.video = new MiniatureVideo(videoUrl, onLoadVideo, () => this.currTime);
  }

  public updateSelectionId(newSelection: number) {
    if (this.selectionId !== newSelection) {
      this.selectionId = newSelection;
      this.refresh();
    }

    const selectedHandle = this.snow?.curve.find(
      (point) => point.id === this.selectionId
    );
    if (selectedHandle) {
      this.mouseOffsetX = selectedHandle.x - this.mouseX;
      this.mouseOffsetY = selectedHandle.y - this.mouseY;
    }
  }

  public mousedown = () => {
    if (this.selectionId) {
      this.drag = true;
    }
  };

  public mouseup = () => {
    if (this.drag) {
      this.drag = false;
    }
  };

  public updateMousePos(x: number, y: number) {
    this.mouseX = x;
    this.mouseY = y;
    this.needsRefreshSelection = true;

    if (this.drag) {
      const selectedHandle = this.snow?.curve.find(
        (point) => point.id === this.selectionId
      );
      if (selectedHandle) {
        selectedHandle.x = this.mouseOffsetX + x;
        selectedHandle.y = this.mouseOffsetY + y;
      }
    }
    // we have different mouseX and pointX
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

function runCreator(state: State) {
  const effects = new Effects();
  const preview = new Preview(state);
  const timeline = new Timeline(state);
  const handles = new Handles();

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
    if (state.drag) {
      state.refresh();
    } else if (state.needsRefreshSelection) {
      const newSelection = handles.updateSelection(
        state,
        state.mouseX,
        state.mouseY
      );
      state.updateSelectionId(newSelection);
      state.needsRefreshSelection = false;
    }

    if (needsRefresh) {
      preview.render(state);
      handles.render(state);
      timeline.render(state);
      effects.render(state);
    }
    requestAnimationFrame(draw);
    // Tell it to use our program (pair of shaders)
  }

  requestAnimationFrame(draw);
}

function onResize(state: State) {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
  resizeCanvas(); // remember to always firstly setup --vh in css
  calcMatrix(); // remember to firstly set size of canvas!
  state.refresh();
}

export default function initCreator(videoUrl: string) {
  const state = new State(videoUrl, runCreator);
  onResize(state);
  window.addEventListener("resize", () => onResize(state));
  initUI(state); // UI initialize skeletonSize, what has to be calculated AFTER setting --vh variable in css to make measurements correctly
}
