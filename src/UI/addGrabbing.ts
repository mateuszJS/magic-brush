export default function addGrabbing(elem: HTMLElement) {
  let prevMouseX: number | undefined = undefined;
  let speed = 0;

  const move = () => {
    if (Math.abs(speed) > 1) {
      elem.scrollLeft += speed;
      speed *= 0.97;
      requestAnimationFrame(move);
    }
  };

  const mouseMoveHandler = (e: MouseEvent) => {
    speed = prevMouseX === undefined ? 0 : prevMouseX - e.clientX;
    elem.scrollLeft += speed;
    prevMouseX = e.clientX;
  };

  const mouseUpHandler = () => {
    elem.style.cursor = "grab";
    elem.style.removeProperty("user-select");
    elem.removeEventListener("mousemove", mouseMoveHandler);
    move();
  };

  const mouseDownHandler = () => {
    speed = 0;
    prevMouseX = undefined;
    elem.addEventListener("mousemove", mouseMoveHandler);
  };

  elem.addEventListener("mouseup", mouseUpHandler);
  elem.addEventListener("mousedown", mouseDownHandler);
}
