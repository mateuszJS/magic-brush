function getFillData(length: number, color: [number, number, number, number]) {
  return Uint8Array.from(
    { length: length * 4 },
    (_value, index) => color[index % 4]
  );
}

type Source = Uint8Pixel | HTMLImageElement | HTMLVideoElement | null;

export default class Texture {
  private texture: WebGLTexture;
  // WebGL return null from create* methods when the context is lost
  // https://www.khronos.org/webgl/public-mailing-list/public_webgl/1203/msg00086.php;
  private frameBuffer: WebGLFramebuffer | null;
  private level: number;
  private htmlSource: HTMLImageElement | HTMLVideoElement | null;

  constructor(
    private gl: WebGLRenderingContext,
    source: Source,
    private width: number,
    private height: number
  ) {
    const newTexture = gl.createTexture();

    if (!newTexture) {
      throw Error(
        "gl.createTexture return null! Probably WebGL context is lost"
      );
    }

    this.texture = newTexture;
    this.level = 0;
    this.htmlSource = null;
    this.frameBuffer = null;

    if (Array.isArray(source)) {
      // it's pixel value
      this.updateWithColorFill(source);
    } else if (source) {
      this.htmlSource = source;
      this.updateWithHTMLElement(source);
    }
  }

  // source parameter is optional, in case of video we just need to update texture with already provided source,
  // we don't need to provide a new source in video case
  updateWithHTMLElement(htmlSource?: HTMLImageElement | HTMLVideoElement) {
    const gl = this.gl;
    if (htmlSource) {
      this.htmlSource = htmlSource;
    }

    if (!this.htmlSource) {
      throw Error("No image or video provided!");
    }

    gl.bindTexture(gl.TEXTURE_2D, this.texture);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      this.htmlSource
    );
  }

  updateWithColorFill(color: Uint8Pixel) {
    // so far we do not support updating size of the texture
    const gl = this.gl;

    gl.bindTexture(gl.TEXTURE_2D, this.texture);

    // set the filtering so we don't need mips
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.texImage2D(
      gl.TEXTURE_2D,
      this.level,
      gl.RGBA, // internal format,
      this.width,
      this.height,
      0, // border,
      gl.RGBA, // format,
      gl.UNSIGNED_BYTE, // type,
      getFillData(this.width * this.height, color)
    );
  }

  getTexture() {
    return this.texture;
  }

  setAsOutput() {
    const gl = this.gl;

    // A renderbuffer is like a texture except it unlike a texture it can't be used as input to a shader. It can only be used as output.
    // A framebuffer is a collection of textures and renderbuffers. When you want to render to a texture you attach one or more textures and renderbuffers to a framebuffer

    if (!this.frameBuffer) {
      // https://webglfundamentals.org/webgl/lessons/webgl-render-to-texture.html

      // Create and bind the framebuffer
      // frame buffers allow you to render to texture or renderbuffers
      // frame buffer is a collection fo attachments
      // by default WebGL has set frame buffer rendering to canvas
      this.frameBuffer = gl.createFramebuffer();

      if (!this.frameBuffer) {
        throw Error(
          "gl.createFramebuffer returns null! Probably WebGl context is lost!"
        );
      }

      gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
      // https://webglfundamentals.org/webgl/lessons/webgl-framebuffers.html

      // to add an attachment you can use framebufferTexture2D or framebufferRenderbuffer
      // depends if destination is a texture or render buffer
      const attachmentPoint = gl.COLOR_ATTACHMENT0;
      // we assume that texture is always pointing to primary created texture, you cannot change this pointer
      gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        attachmentPoint,
        gl.TEXTURE_2D,
        this.texture,
        this.level
      );
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);

    // render cube with our 3x2 texture
    // gl.bindTexture(gl.TEXTURE_2D, this.texture);

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, this.width, this.height);

    // Clear the attachment(s).
    gl.clearColor(0, 0, 0, 1); // clear to black
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }
}
