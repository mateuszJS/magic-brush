let callbacksList: VoidFunction[] = [];

export function addResizeListener(cb: VoidFunction): VoidFunction {
  callbacksList.push(cb);

  return () => {
    callbacksList = callbacksList.filter((f) => f !== cb);
  };
}

function onResize() {
  callbacksList.forEach((f) => f());
}

window.addEventListener("resize", onResize);

export function initResizeEvent(gl: WebGL2RenderingContext) {
  const canvas = gl.canvas as HTMLCanvasElement;

  const resizeCanvas = () => {
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
  };

  resizeCanvas();

  addResizeListener(resizeCanvas);
}
