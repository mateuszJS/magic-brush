export default class Attribute {
  private location: number;
  private positionBuffer: WebGLBuffer;

  constructor(
    private gl: WebGLRenderingContext,
    private program: WebGLProgram,
    private name: string
  ) {
    this.location = gl.getAttribLocation(program, name);
    this.positionBuffer = gl.createBuffer();
  }

  set(value: number[]) {
    this.gl.enableVertexAttribArray(this.location);

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);

    this.gl.vertexAttribPointer(
      this.location,
      2, // size, 2 components per iteration
      this.gl.FLOAT, // type, the data is 32bit floats
      false, // normalize, don't normalize the data
      0, // stride, 0 = move forward size * sizeof(type) each iteration to get the next position
      0 // offset, start at the beginning of the buffer
    );

    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array(value),
      this.gl.STATIC_DRAW
    );
  }
}
