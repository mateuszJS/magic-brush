import FrameBuffer from "models/FrameBuffer";

export default function setupRenderTarget(
  target: FrameBuffer | null,
  clearColor?: vec4
) {
  const gl = window.gl;

  if (target == null) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
  } else {
    gl.bindFramebuffer(gl.FRAMEBUFFER, target.frameBufferLocation);
    gl.viewport(0, 0, target.texture.width, target.texture.height);
  }

  if (clearColor) {
    gl.clearColor(...clearColor); // clear to black
    gl.clear(gl.COLOR_BUFFER_BIT);
  }
}
