// import captureStreamFromCanvas from "../utils/captureStreamFromCanvas";

let isPanelOpen = window.localStorage.getItem("isPanelOpen") === "true";

const panelContent = `
  MENU
`;

export default function initEditMenu(mainContainer: HTMLElement) {
  const panelNode = document.createElement("ul");
  panelNode.innerHTML = panelContent;
  panelNode.classList.add("edit-menu");
  mainContainer.appendChild(panelNode);

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
}
