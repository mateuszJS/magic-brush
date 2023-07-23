import { isMobile } from "consts";

function getCoordsFromTouch(event: TouchEvent): [number, number] {
  const touch = event.touches[0];
  // we assume that canvas is places in very top left corner, no offset
  return [touch.pageX, touch.pageY];
}

export default function attachListeners(
  onPointerDown: (x: number, y: number) => void,
  onPointerMove: (x: number, y: number) => void,
  onPointerUp: () => void
) {
  const preview = document.querySelector<HTMLElement>(".preview");
  if (!preview) throw Error("No preview node!");

  // we assume that canvas is places in very top left corner, no offset
  // so we do not have to subtract left top corner of the listening node
  if (isMobile) {
    preview.addEventListener("touchstart", (e) => {
      const [x, y] = getCoordsFromTouch(e);
      onPointerDown(x, y);
    });
    preview.addEventListener("touchmove", (e) => {
      const [x, y] = getCoordsFromTouch(e);
      onPointerMove(x, y);
    });
  } else {
    preview.addEventListener("mousedown", (e) => {
      onPointerDown(e.clientX, e.clientY);
    });
    preview.addEventListener("mousemove", (e) => {
      onPointerMove(e.clientX, e.clientY);
    });
  }

  preview.addEventListener(isMobile ? "touchend" : "mouseup", onPointerUp);
}
