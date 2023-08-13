import playSvg from "./icons/play-icon.svg";
import pauseSvg from "./icons/pause-icon.svg";
import brushSvg from "./icons/brush-icon.svg";
import State from "State";

const playBtn = document.createElement("button");
const pauseBtn = document.createElement("button");

export function updateToolbar(state: State) {
  if (state.video.isPlaying) {
    pauseBtn.classList.remove("hide");
    playBtn.classList.add("hide");
  } else {
    pauseBtn.classList.add("hide");
    playBtn.classList.remove("hide");
  }
}

// let stopRecordingCallback: VoidFunction | null = null;
// window.startRecordBtn.addEventListener("click", () => {
//   stopRecordingCallback = captureStreamFromCanvas(canvasNode);
//   window.stopRecordBtn.classList.add("visible");
//   window.startRecordBtn.classList.remove("visible");
// });

// window.stopRecordBtn.addEventListener("click", () => {
//   window.startRecordBtn.classList.add("visible");
//   window.stopRecordBtn.classList.remove("visible");
//   stopRecordingCallback?.();
//   stopRecordingCallback = null;

export default function createToolbar(state: State) {
  const root = document.createElement("ul");
  root.classList.add("toolbar");

  playBtn.innerHTML = playSvg;
  pauseBtn.innerHTML = pauseSvg;
  pauseBtn.classList.add("hide");

  playBtn.addEventListener("click", state.playVideo);
  pauseBtn.addEventListener("click", state.pauseVideo);

  const brushBtn = document.createElement("button");
  brushBtn.innerHTML = brushSvg;
  brushBtn.addEventListener("click", state.toggleBrushMode);

  const slider = document.createElement("input");
  slider.setAttribute("min", "0");
  slider.setAttribute("max", "1000");
  slider.setAttribute("value", "0");
  slider.setAttribute("type", "range");

  slider.addEventListener("input", function (e) {
    state.simplifySpline(Number(this.value) / 1000);
  });

  // const updateHTML = () => {
  //   panelNode.classList[isPanelOpen ? "remove" : "add"]("visible");
  // };

  // window.panelTrigger.addEventListener("click", () => {
  //   isPanelOpen = !isPanelOpen;
  //   window.localStorage.setItem("isPanelOpen", isPanelOpen.toString());
  //   updateHTML();
  // });

  // updateHTML();

  // let stopRecordingCallback: VoidFunction | null = null;
  // window.startRecordBtn.addEventListener("click", () => {
  //   stopRecordingCallback = captureStreamFromCanvas(canvasNode);
  //   window.stopRecordBtn.classList.add("visible");
  //   window.startRecordBtn.classList.remove("visible");
  // });

  // window.stopRecordBtn.addEventListener("click", () => {
  //   window.startRecordBtn.classList.add("visible");
  //   window.stopRecordBtn.classList.remove("visible");
  //   stopRecordingCallback?.();
  //   stopRecordingCallback = null;
  // });
  root.appendChild(playBtn);
  root.appendChild(pauseBtn);
  root.appendChild(brushBtn);
  root.appendChild(slider);

  return root;
}
