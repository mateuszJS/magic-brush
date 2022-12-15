export default class Texture {
  private location: number;
  private bufferAddress: WebGLBuffer;
  private texture: WebGLTexture;

  constructor(
    private gl: WebGLRenderingContext,
    private img: HTMLImageElement | HTMLVideoElement
  ) {
    this.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.texture);

    // Set the parameters so we can render any size image.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    // Upload the image into the texture.
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      this.img
    );
  }

  update() {
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
    this.gl.texImage2D(
      this.gl.TEXTURE_2D,
      0,
      this.gl.RGBA,
      this.gl.RGBA,
      this.gl.UNSIGNED_BYTE,
      this.img
    );
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
