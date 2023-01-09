import glExt, { updateExtensions } from "../extensions";

export default function initWebGL2(canvas: HTMLCanvasElement) {
  const params: WebGLContextAttributes = {
    alpha: true,
    depth: false,
    stencil: false,
    antialias: false,
    preserveDrawingBuffer: false,
  };

  const gl = canvas.getContext("webgl2", params);

  if (!gl) {
    throw Error("No WebGL2 detected. We do support ONLY WebGL2");
  }

  if (!glExt.isReady) {
    updateExtensions(gl);
  }

  gl.enable(gl.BLEND);
  // we assume we are working with pre-multiplied alpha textures
  // https://webglfundamentals.org/webgl/lessons/webgl-and-alpha.html
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  return gl;
}
