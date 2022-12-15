export {}; // just to indicate that it's a module, so I can declare "global"

declare global {
  interface Window {
    panel: HTMLElement;
    panelTrigger: HTMLButtonElement;
    startRecordBtn: HTMLButtonElement;
    stopRecordBtn: HTMLButtonElement;
  }
}
