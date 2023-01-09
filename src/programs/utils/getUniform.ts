export function getUniform(
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  name: string
) {
  const uniformLocation = gl.getUniformLocation(program, name);
  if (!uniformLocation) {
    throw Error(
      "gl.getUniformLocation returned null! It's very likely that WebGL has lost the context"
    );
  }

  return uniformLocation;
}
