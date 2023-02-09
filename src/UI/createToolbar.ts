import playSvg from "./icons/play-icon.svg";
import pauseSvg from "./icons/pause-icon.svg";
import { State } from "initCreator";

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

export default function createToolbar(state: State) {
  const root = document.createElement("ul");
  root.classList.add("toolbar");

  playBtn.innerHTML = playSvg;
  pauseBtn.innerHTML = pauseSvg;
  pauseBtn.classList.add("hide");

  playBtn.addEventListener("click", state.playVideo);
  pauseBtn.addEventListener("click", state.pauseVideo);

  root.appendChild(playBtn);
  root.appendChild(pauseBtn);

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

  return root;
}
