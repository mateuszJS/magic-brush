export function createProgram(
  gl: WebGL2RenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader
) {
  const program = gl.createProgram();
  if (!program) {
    throw Error(
      "gl.createProgram returned null! Probably webgl context has been lost"
    );
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);

  return program;
}
