import "./styles/index.scss";
import { initUI, updateTimelineScroll } from "UI";
import { calcMatrix } from "programs/canvasMatrix";
import resizeCanvas from "utils/resizeCanvas";
import Timeline from "components/Timeline";
import Preview from "components/Preview";
import Interactivity from "components/Interactivity";
import Effects from "components/Effects";
import State from "State";
import CurveSkeleton from "components/CurveSkeleton";

function runCreator(state: State) {
  const effects = new Effects();
  const preview = new Preview(state);
  const timeline = new Timeline(state);
  const curveSkeleton = new CurveSkeleton();
  const drawCalls = [(matrix: Mat3) => effects.renderPick(state, matrix)];
  const interactivity = new Interactivity(state, drawCalls);

  function draw(now: DOMHighResTimeStamp) {
    let { needsRefresh } = state; // make save copy of needsRefresh value
    state.needsRefresh = false; // set next needsRefresh to false by default
    if (state.video.isPlaying) {
      if (state.video.currTime > state.currTime) {
        // > sign because of mobile sometimes player on the starts plays from like a second(or half) before
        /*
          1. we update scroll position
          2. It imitates user interaction, so event for changing scroll is fired
          3. That scroll event update currTime and refresh in the state
        */
        state.currTime = state.video.currTime;
        updateTimelineScroll(state);
        needsRefresh = true;
      }
    }

    if (needsRefresh) {
      preview.render(state);
      timeline.render(state);
      effects.render(state);
      curveSkeleton.render(state);
      interactivity.render(state);
      state.video.triggerRequest();
    }

    requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);
}

function onResize(state: State) {
  resizeCanvas();
  calcMatrix(); // remember to firstly set size of canvas!
  state.refresh();
}

export default function initCreator(videoUrl: string) {
  const state = new State(videoUrl, runCreator);
  onResize(state);
  window.addEventListener("resize", () => onResize(state));
  initUI(state);
}
