export function getUniform(program: WebGLProgram, name: string) {
  const uniformLocation = window.gl.getUniformLocation(program, name);
  // it's not clear why it it sn't returning just a number. In openGL it return integer for attributes AND for uniforms location as well!
  if (!uniformLocation) {
    throw Error(
      "gl.getUniformLocation returned null! It's very likely that WebGL has lost the context"
    );
  }

  return uniformLocation;
}
