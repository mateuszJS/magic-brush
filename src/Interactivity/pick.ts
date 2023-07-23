import FrameBuffer from "models/FrameBuffer";
import Texture from "models/Texture";
import setupRenderTarget from "renders/setupRenderTarget";
import m3 from "utils/m3";

export enum ControlType {
  nil = 0,
  path = 1,
  thickness = 2,
}

export type DrawCall = (matrix: Mat3) => void;

const BUFFER_SIZE = 1;
const NO_SELECTION = new Float32Array([0, 0, 0, 0]);

export default function pick(
  path: Point[],
  x: number,
  y: number,
  drawCalls: DrawCall[]
) {
  if (path.length < 2) return NO_SELECTION;

  const gl = window.gl;
  const texture = new Texture();

  texture.fill({
    isFloat: true,
    width: BUFFER_SIZE,
    height: BUFFER_SIZE,
  });

  const fbo = new FrameBuffer(texture);
  setupRenderTarget(fbo);

  const translatedMatrix = m3.translate(
    m3.projectionFlipY(BUFFER_SIZE, BUFFER_SIZE),
    -x,
    -y
  );

  // draw complicated items with the usage of other classes, like bezier curves
  drawCalls.forEach((drawCall) => drawCall(translatedMatrix));

  const data = new Float32Array(4);
  const fboFormat = gl.RGBA;
  const type = gl.FLOAT;
  gl.readPixels(0, 0, BUFFER_SIZE, BUFFER_SIZE, fboFormat, type, data);
  return data;
}
