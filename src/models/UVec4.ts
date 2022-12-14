export default class UVec4 {
  private location: WebGLUniformLocation;
  constructor(
    private gl: WebGLRenderingContext,
    private program: WebGLProgram,
    private name: string
  ) {
    this.location = gl.getUniformLocation(program, name);
  }

  set(value: [number, number, number, number]) {
    this.gl.uniform4fv(this.location, value);
  }
}
