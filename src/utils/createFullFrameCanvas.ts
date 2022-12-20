export default function createFullFrameCanvas(width?: number, height?: number) {
  const canvas = document.createElement<"canvas">("canvas");

  document.body.appendChild(canvas);

  const resizeCanvas = () => {
    canvas.width = width || canvas.clientWidth;
    canvas.height = height || canvas.clientHeight;
  };

  document.addEventListener("resize", resizeCanvas);

  resizeCanvas();

  return canvas;
}
