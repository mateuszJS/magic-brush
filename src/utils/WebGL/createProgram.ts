function compileShader(
  gl: WebGLRenderingContext,
  shaderType: typeof gl.VERTEX_SHADER | typeof gl.FRAGMENT_SHADER,
  shaderSource: string
) {
  const shader = gl.createShader(shaderType);

  if (!shader) {
    throw Error(
      "gl.createShader returns null! Probably WebGL context is lost!"
    );
  }

  gl.shaderSource(shader, shaderSource);
  gl.compileShader(shader);

  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);

  if (!success) {
    throw "could not compile shader:" + gl.getShaderInfoLog(shader);
  }

  return shader;
}

export default function createProgram(
  gl: WebGLRenderingContext,
  vertexShaderSource: string,
  fragmentShaderSource: string
) {
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = compileShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource
  );

  const program = gl.createProgram();

  if (!program) {
    throw Error(
      "gl.createProgram returns null! Probably WebGL context is lost!"
    );
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);

  gl.linkProgram(program);

  const success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!success) {
    throw "program failed to link:" + gl.getProgramInfoLog(program);
  }

  return program;
}
