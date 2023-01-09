export function compileShader(
  gl: WebGL2RenderingContext,
  shaderType: WebGL2RenderingContext["VERTEX_SHADER" | "FRAGMENT_SHADER"],
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
