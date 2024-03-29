function getCoordsFromTouch(event: TouchEvent): Point {
  const touch = event.touches[0] || event;
  // we assume that canvas is places in very top left corner, no offset
  return { x: touch.pageX, y: touch.pageY };
}

export default function attachListeners(
  onPointerDown: (pointer: Point) => void,
  onPointerMove: (pointer: Point) => void,
  onPointerUp: (pointer: Point) => void
) {
  const preview = document.querySelector<HTMLElement>(".preview")!;

  // we assume that canvas is places in very top left corner, no offset
  // so we do not have to subtract left top corner of the listening node

  preview.addEventListener("touchstart", (e) => {
    e.preventDefault(); // to prevent duplicated event because of mouse event, on Edge browser a tap triggers both touch and mouse events
    const pointer = getCoordsFromTouch(e);
    onPointerDown(pointer);
  });
  preview.addEventListener("touchmove", (e) => {
    e.preventDefault(); // to prevent duplicated event because of mouse event, on Edge browser a tap triggers both touch and mouse events
    const pointer = getCoordsFromTouch(e);
    onPointerMove(pointer);
  });
  preview.addEventListener("touchend", (e) => {
    e.preventDefault(); // to prevent duplicated event because of mouse event, on Edge browser a tap triggers both touch and mouse events
    const pointer = getCoordsFromTouch(e);
    onPointerUp(pointer);
  });

  preview.addEventListener("mousedown", (e) => {
    onPointerDown({ x: e.clientX, y: e.clientY });
  });
  preview.addEventListener("mousemove", (e) => {
    onPointerMove({ x: e.clientX, y: e.clientY });
  });
  preview.addEventListener("mouseup", (e) => {
    onPointerUp({ x: e.clientX, y: e.clientY });
  });
}
