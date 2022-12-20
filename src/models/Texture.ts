export default class Texture {
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
    const data: null = null;
    gl.texImage2D(
      gl.TEXTURE_2D,
      level,
      internalFormat,
      width,
      height,
      border,
      format,
      type,
      data
    );

    // set the filtering so we don't need mips
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // https://webglfundamentals.org/webgl/lessons/webgl-render-to-texture.html

    // Create and bind the framebuffer
    this.frameBuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);

    // attach the texture as the first color attachment
    const attachmentPoint = gl.COLOR_ATTACHMENT0;
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      attachmentPoint,
      gl.TEXTURE_2D,
      this.texture,
      level
    );
  }

  setAsOutput() {
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.frameBuffer);

    // render cube with our 3x2 texture
    // this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);

    // Tell WebGL how to convert from clip space to pixels
    this.gl.viewport(0, 0, this.width, this.height);

    // Clear the attachment(s).
    this.gl.clearColor(0, 0, 1, 1); // clear to blue
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
  }

  update() {
    // this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
    // this.gl.texImage2D(
    //   this.gl.TEXTURE_2D,
    //   0,
    //   this.gl.RGBA,
    //   this.gl.RGBA,
    //   this.gl.UNSIGNED_BYTE
    //   // this.img
    // );
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