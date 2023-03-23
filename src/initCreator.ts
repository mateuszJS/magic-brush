import "./styles/index.scss";
import { initUI, updateTimelineScroll } from "UI";
import { calcMatrix } from "programs/canvasMatrix";
import resizeCanvas from "utils/resizeCanvas";
import Timeline from "Timeline";
import Preview from "Preview";
import Handles from "Handles";
import Effects from "Effects";
import State from "State";

function runCreator(state: State) {
  const effects = new Effects();
  const preview = new Preview(state);
  const timeline = new Timeline(state);
  const handles = new Handles();

  state.testSelection = handles.updateSelection;

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
      handles.render(state);
      timeline.render(state);
      effects.render(state);
      state.video.triggerRequest();
    }

    requestAnimationFrame(draw);
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
