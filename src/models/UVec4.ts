export default class UVec4 {
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

  set(value: [number, number, number, number]) {
    this.gl.uniform4fv(this.location, value);
  }
}
