export default class UMat3 {
  private location: WebGLUniformLocation;
  constructor(
    private gl: WebGLRenderingContext,
    private program: WebGLProgram,
    private name: string
  ) {
    this.location = gl.getUniformLocation(program, name);
  }

  set(value: Array9Len) {
    this.gl.uniformMatrix3fv(this.location, false, value);
  }
}
