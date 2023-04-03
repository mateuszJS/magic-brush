export function getUniform(program: WebGLProgram, name: string) {
  const uniformLocation = window.gl.getUniformLocation(program, name);
  // it's not clear why it it sn't returning just a number. In openGL it return integer for attributes AND for uniforms location as well!
  if (!uniformLocation) {
    throw Error(
      `Couldn't find uniform called: ${name}. Make sure it does exist in any shader.`
    );
  }

  return uniformLocation;
}
