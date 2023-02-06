import { MINI_SIZE } from "consts";
import { drawSprite } from "programs";

export function getMiniatureTexCoords(width: number, height: number) {
  const offsetY = (Math.max(0, height - width) * 0.5) / height;
  const offsetX = (Math.max(0, width - height) * 0.5) / width;

  return new Float32Array([
    offsetX,
    offsetY,
    offsetX,
    1 - offsetY,
    1 - offsetX,
    1 - offsetY,
    1 - offsetX,
    offsetY,
  ]);
}

export function getAttrs(
  maxMinisQuantity: number,
  videoWidth: number,
  videoHeight: number
): WebGLVertexArrayObject {
  // TODO: we should render max miniatures number on the screen!!! not max total!
  const positions = new Float32Array([
    0,
    0,
    0,
    MINI_SIZE,
    MINI_SIZE,
    MINI_SIZE,
    MINI_SIZE,
    0,
  ]);
  const texCoords = new Float32Array(
    getMiniatureTexCoords(videoWidth, videoHeight)
  );
  const offsetX = new Float32Array(
    Array.from(
      { length: maxMinisQuantity },
      (_, index) => index * (MINI_SIZE / window.gl.drawingBufferWidth) * 2
    )
  );
  const depth = new Float32Array(
    Array.from({ length: maxMinisQuantity }, (_, index) => index)
  );
  const indexes = new Uint16Array([0, 1, 2, 0, 2, 3]);

  return drawSprite.createVAO(texCoords, positions, depth, offsetX, indexes);
}
