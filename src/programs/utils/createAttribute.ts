export function setAttribute(location: number, arrayBufferData: BufferSource) {
  const gl = window.gl;
  const arrayBufferLocation = gl.createBuffer();
  // we create buffer here because it needs to be called for each VAO individually
  if (!arrayBufferLocation) {
    throw Error("gl.createBuffer return null! Probably WebGL context is lost!");
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, arrayBufferLocation); // seems like I
  gl.bufferData(gl.ARRAY_BUFFER, arrayBufferData, gl.STATIC_DRAW);

  // gl.vertexAttrib3f What is that?
  gl.vertexAttribPointer(
    location,
    2, // size, 2 components per iteration
    gl.FLOAT, // type, the data is 32bit floats
    false, // normalize, don't normalize the data
    0, // stride, 0 = move forward size * sizeof(type) each iteration to get the next position
    //  attrib.stride = stride ? stride : sizeof(type) * size;
    0 // offset, start at the beginning of the buffer
  );
  gl.enableVertexAttribArray(location);
}

export function setIndex(arrayBufferData: BufferSource) {
  const gl = window.gl;
  const arrayBufferLocation = gl.createBuffer();
  if (!arrayBufferLocation) {
    throw Error("gl.createBuffer return null! Probably WebGL context is lost!");
  }

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, arrayBufferLocation);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, arrayBufferData, gl.STATIC_DRAW);
}
