import FrameBuffer from "models/FrameBuffer";
import Texture from "models/Texture";
import setupRenderTarget from "renders/setupRenderTarget";
import m3 from "utils/m3";

export enum ControlType {
  nil = 0,
  path = 1,
  width = 2,
}

export type DrawCall = (matrix: Mat3) => void;

const BUFFER_SIZE = 1;
const NO_SELECTION = new Float32Array([0, 0, 0, 0]);

export default function pick(
  path: Point[],
  pointer: Point,
  drawCalls: DrawCall[]
) {
  if (path.length < 2) return NO_SELECTION; // it's just optimization, can be omitted

  const gl = window.gl;
  const texture = new Texture();
  gl.disable(gl.BLEND); // on iOS EXT_float_blend wasn't present
  // because of that, all rendering with alpha to floating point texture was omitted
  // we could also change texture internal format(RGBA32F) but seems like there is no RGB32F
  // table with extensions https://webgl2fundamentals.org/webgl/lessons/webgl-data-textures.html

  texture.fill({
    isFloat: true,
    width: BUFFER_SIZE,
    height: BUFFER_SIZE,
  });

  const fbo = new FrameBuffer(texture);
  setupRenderTarget(fbo);

  const translatedMatrix = m3.translate(
    m3.projectionFlipY(BUFFER_SIZE, BUFFER_SIZE),
    -pointer.x,
    -pointer.y
  );

  // draw items with the usage of other classes, like bezier curves
  drawCalls.forEach((drawCall) => drawCall(translatedMatrix));

  const data = new Float32Array(4);
  const fboFormat = gl.RGBA;
  const type = gl.FLOAT;
  gl.readPixels(0, 0, BUFFER_SIZE, BUFFER_SIZE, fboFormat, type, data);

  gl.enable(gl.BLEND);

  return data;
}
