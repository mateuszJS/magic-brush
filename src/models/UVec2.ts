export default class UVec2 {
  private location: WebGLUniformLocation;
  constructor(
    private gl: WebGLRenderingContext,
    private program: WebGLProgram,
    private name: string
  ) {
    this.location = gl.getUniformLocation(program, name);
  }

  set(value: [number, number]) {
    this.gl.uniform2fv(this.location, value);
  }
}
