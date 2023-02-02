export default function resizeCanvas() {
  const canvas = window.gl.canvas as HTMLCanvasElement;

  const displayWidth = canvas.clientWidth;
  const displayHeight = canvas.clientHeight;
  // Check if the canvas is not the same size.
  const needResize =
    canvas.width !== displayWidth || canvas.height !== displayHeight;

  if (needResize) {
    // Make the canvas the same size
    canvas.width = displayWidth;
    canvas.height = displayHeight;
  }
}
