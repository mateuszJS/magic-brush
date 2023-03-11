export function createDynamicAttr(
  program: WebGLProgram,
  location: number,
  name: string,
  componentPerIter = 2
) {
  const gl = window.gl;

  gl.bindAttribLocation(program, location, name); // this bind attribute under specific location, needs to call just once per program

  const arrayBufferLocation = gl.createBuffer();
  // we create buffer here because it needs to be called for each VAO individually
  if (!arrayBufferLocation) {
    throw Error("gl.createBuffer return null! Probably WebGL context is lost!");
  }

  return (arrayBufferData: BufferSource) => {
    gl.bindBuffer(gl.ARRAY_BUFFER, arrayBufferLocation);
    gl.bufferData(gl.ARRAY_BUFFER, arrayBufferData, gl.DYNAMIC_DRAW);

    // gl.vertexAttrib3f What is that?
    gl.vertexAttribPointer(
      location,
      componentPerIter, // size, components per iteration
      gl.FLOAT, // type, the data is 32bit floats
      false, // normalize, don't normalize the data. Only applies to integers(8 and 16-bit), so effect on floats. So if it's unsigned i8, value will be normalized assuming that max is 255, min is 0
      0, // stride, 0 = move forward size * sizeof(type) each iteration to get the next position
      // stride is the length of each chunk, measure in bytes, one 32Float is 4 bytes
      //  attrib.stride = stride ? stride : sizeof(type) * size;
      0 // offset, start at the beginning of the buffer
      // number of bytes we need to skip to get first value
    );

    gl.enableVertexAttribArray(location);
  };
}

export function setAttribute(
  location: number,
  componentPerIter: number,
  divisor?: "vertex" | "instance",
  initialBufferData?: BufferSource
) {
  const gl = window.gl;
  const arrayBufferLocation = gl.createBuffer();
  // we create buffer here because it needs to be called for each VAO individually
  if (!arrayBufferLocation) {
    throw Error("gl.createBuffer return null! Probably WebGL context is lost!");
  }
  /*
    for debugging attributes you can use function gl.vertexAttrib[1234]f
    it will provide default value for you attributes
    doesn't need creating buffer, be enabled etc.
    It can be good when you program don't have to change attributes values at all.. I'm not sure
  */

  gl.bindBuffer(gl.ARRAY_BUFFER, arrayBufferLocation);
  const updateBuffer = (arrayBufferData: BufferSource) => {
    gl.bindBuffer(gl.ARRAY_BUFFER, arrayBufferLocation);
    gl.bufferData(gl.ARRAY_BUFFER, arrayBufferData, gl.STATIC_DRAW);
  };

  if (initialBufferData) {
    updateBuffer(initialBufferData);
  }

  // gl.vertexAttrib3f What is that?
  gl.vertexAttribPointer(
    location,
    componentPerIter, // size, components per iteration
    gl.FLOAT, // type, the data is 32bit floats
    false, // normalize, don't normalize the data. Only applies to integers(8 and 16-bit), so effect on floats. So if it's unsigned i8, value will be normalized assuming that max is 255, min is 0
    0, // stride, 0 = move forward size * sizeof(type) each iteration to get the next position
    // stride is the length of each chunk, measure in bytes, one 32Float is 4 bytes
    //  attrib.stride = stride ? stride : sizeof(type) * size;
    0 // offset, start at the beginning of the buffer
    // number of bytes we need to skip to get first value
  );

  gl.enableVertexAttribArray(location);

  if (divisor) {
    gl.vertexAttribDivisor(location, divisor === "vertex" ? 0 : 1);
  }

  return updateBuffer;
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
