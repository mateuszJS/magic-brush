export function splitFloatIntoVec3(value: number): [number, number, number] {
  return [
    ((value >> 0) & 0xff) / 0xff,
    ((value >> 8) & 0xff) / 0xff,
    ((value >> 16) & 0xff) / 0xff,
    // ((value >> 24) & 0xFF) / 0xFF,
  ];
}

export function getIdFromLastRender(gl: WebGL2RenderingContext) {
  const data = new Uint8Array(4);
  gl.readPixels(
    0, // x
    0, // y
    1, // width
    1, // height
    gl.RGBA, // format
    gl.UNSIGNED_BYTE, // type
    data
  ); // typed array to hold result
  // const id = data[0] + (data[1] << 8) + (data[2] << 16) + (data[3] << 24);
  const id = data[0] + (data[1] << 8) + (data[2] << 16);

  return id;
}
