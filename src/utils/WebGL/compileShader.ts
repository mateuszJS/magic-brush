export default function compileShader(
  gl: WebGLRenderingContext,
  shaderType: typeof gl.VERTEX_SHADER | typeof gl.FRAGMENT_SHADER,
  shaderSource: string
) {
  const shader = gl.createShader(shaderType);

  gl.shaderSource(shader, shaderSource);
  gl.compileShader(shader);

  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);

  if (!success) {
    throw "could not compile shader:" + gl.getShaderInfoLog(shader);
  }

  return shader;
}
