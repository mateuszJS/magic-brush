export default function createFullFrameCanvas() {
  const canvas = document.createElement<"canvas">("canvas");

  document.body.appendChild(canvas);

  const resizeCanvas = () => {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
  };

  document.addEventListener("resize", resizeCanvas);

  resizeCanvas();

  return canvas;
}
