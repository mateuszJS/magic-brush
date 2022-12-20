export default class TextureSolidFill {
  // private location: number;
  // private bufferAddress: WebGLBuffer;
  public texture: WebGLTexture;
  private frameBuffer: WebGLFramebuffer;

  constructor(
    private gl: WebGLRenderingContext,
    private width: number,
    private height: number
  ) {
    this.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.texture);

    const level = 0;
    const internalFormat = gl.RGBA;
    const border = 0;
    const format = gl.RGBA;
    const type = gl.UNSIGNED_BYTE;
    const data: number[] = [];

    for (let i = 0; i < width * height; i++) {
      data.push(255);
      data.push(0);
      data.push(0);
      data.push(255);
    }

    gl.texImage2D(
      gl.TEXTURE_2D,
      level,
      internalFormat,
      width,
      height,
      border,
      format,
      type,
      new Uint8Array(data)
    );

    // set the filtering so we don't need mips
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  }

  set(value: number[]) {
    // this.gl.enableVertexAttribArray(this.location);
    // this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.bufferAddress);
    // this.gl.vertexAttribPointer(
    //   this.location,
    //   2, // size, 2 components per iteration
    //   this.gl.FLOAT, // type, the data is 32bit floats
    //   false, // normalize, don't normalize the data
    //   0, // stride, 0 = move forward size * sizeof(type) each iteration to get the next position
    //   0 // offset, start at the beginning of the buffer
    // );
    // this.gl.bufferData(
    //   this.gl.ARRAY_BUFFER,
    //   new Float32Array(value),
    //   this.gl.STATIC_DRAW
    // );
  }
}
