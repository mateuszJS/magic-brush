export function createAttribute(
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  name: string
) {
  const attributeLocation = gl.getAttribLocation(program, name);
  if (attributeLocation < 0) {
    throw Error(`Failed to get the storage location of attribute: ${name}`);
  }

  const arrayBufferLocation = gl.createBuffer();
  if (!arrayBufferLocation) {
    throw Error("gl.createBuffer return null! Probably WebGL context is lost!");
  }

  return (arrayBufferData: BufferSource) => {
    gl.bindBuffer(gl.ARRAY_BUFFER, arrayBufferLocation);
    gl.bufferData(gl.ARRAY_BUFFER, arrayBufferData, gl.STATIC_DRAW);

    // gl.vertexAttrib3f What is that?
    gl.vertexAttribPointer(
      attributeLocation,
      2, // size, 2 components per iteration
      gl.FLOAT, // type, the data is 32bit floats
      false, // normalize, don't normalize the data
      0, // stride, 0 = move forward size * sizeof(type) each iteration to get the next position
      //  attrib.stride = stride ? stride : sizeof(type) * size;
      0 // offset, start at the beginning of the buffer
    );
    gl.enableVertexAttribArray(attributeLocation);
  };
}

export function createAttrIndex(gl: WebGL2RenderingContext) {
  const arrayBufferLocation = gl.createBuffer();
  if (!arrayBufferLocation) {
    throw Error("gl.createBuffer return null! Probably WebGL context is lost!");
  }

  return (arrayBufferData: BufferSource) => {
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, arrayBufferLocation);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, arrayBufferData, gl.STATIC_DRAW);
  };
}
