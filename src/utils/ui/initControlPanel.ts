import captureStreamFromCanvas from "../captureStreamFromCanvas";

let isPanelOpen = window.localStorage.getItem("isPanelOpen") === "true";

const panelContent = `
  <button id="panelTrigger"></button>
  <section class="panel-row">
    <button id="startRecordBtn" class="visible">RECORD</button>
    <button id="stopRecordBtn">STOP</button>
  </section>
`;

export default function initControlPanel(canvasNode: HTMLCanvasElement) {
  const panelNode = document.createElement<"article">("article");
  panelNode.innerHTML = panelContent;
  panelNode.id = "panel";
  document.body.appendChild(panelNode);

  const updateHTML = () => {
    panelNode.classList[isPanelOpen ? "remove" : "add"]("visible");
  };

  window.panelTrigger.addEventListener("click", () => {
    isPanelOpen = !isPanelOpen;
    window.localStorage.setItem("isPanelOpen", isPanelOpen.toString());
    updateHTML();
  });

  updateHTML();

  let stopRecordingCallback: VoidFunction | null = null;
  window.startRecordBtn.addEventListener("click", () => {
    stopRecordingCallback = captureStreamFromCanvas(canvasNode);
    window.stopRecordBtn.classList.add("visible");
    window.startRecordBtn.classList.remove("visible");
  });

  window.stopRecordBtn.addEventListener("click", () => {
    window.startRecordBtn.classList.add("visible");
    window.stopRecordBtn.classList.remove("visible");
    stopRecordingCallback?.();
    stopRecordingCallback = null;
  });
}
