export function getUniform(program: WebGLProgram, name: string) {
  const uniformLocation = window.gl.getUniformLocation(program, name);
  if (!uniformLocation) {
    throw Error(
      "gl.getUniformLocation returned null! It's very likely that WebGL has lost the context"
    );
  }

  return uniformLocation;
}
