import { MINIATURE_SIZE, MS_PER_PIXEL } from "consts";
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
  videoDuration: number,
  videoWidth: number,
  videoHeight: number
): WebGLVertexArrayObject {
  const length = Math.ceil(videoDuration / MS_PER_PIXEL / MINIATURE_SIZE);
  const positions = new Float32Array([
    0,
    0,
    0,
    MINIATURE_SIZE,
    MINIATURE_SIZE,
    MINIATURE_SIZE,
    MINIATURE_SIZE,
    0,
  ]);
  const texCoords = new Float32Array(
    getMiniatureTexCoords(videoWidth, videoHeight)
  );
  const offsetX = new Float32Array(
    Array.from(
      { length },
      (_, index) => index * (MINIATURE_SIZE / window.gl.drawingBufferWidth) * 2
    )
  );
  const depth = new Float32Array(Array.from({ length }, (_, index) => index));
  const indexes = new Uint16Array([0, 1, 2, 0, 2, 3]);

  return drawSprite.createVAO(texCoords, positions, depth, offsetX, indexes);
}
