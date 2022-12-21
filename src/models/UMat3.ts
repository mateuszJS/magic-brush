export default class UMat3 {
  private location: WebGLUniformLocation;
  constructor(
    private gl: WebGLRenderingContext,
    program: WebGLProgram,
    name: string
  ) {
    const location = gl.getUniformLocation(program, name);

    if (!location) {
      throw Error(
        "gl.getUniformLocation return null! Probably WebGL context is lost!"
      );
    }

    this.location = location;
  }

  set(value: Matrix3) {
    this.gl.uniformMatrix3fv(this.location, false, value);
  }
}
