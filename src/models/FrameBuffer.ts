import Texture from "./Texture";

export default class FrameBuffer {
  readonly texture: Texture;
  // public texelSizeX: number
  // public texelSizeY: number
  readonly frameBufferLocation: WebGLFramebuffer;
  // we should use better names for internalFormat, format and type
  constructor() {
    const gl = window.gl;
    // not sure if texture should be here, or should it be passed from arguments
    // also most of this constructor should be actually in render or attach
    this.texture = new Texture();

    const newFrameBuffer = gl.createFramebuffer();
    if (!newFrameBuffer) {
      throw Error(
        "gl.createFramebuffer return null! Probably WebGL context is lost"
      );
    }

    this.frameBufferLocation = newFrameBuffer;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBufferLocation);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0, // attach the texture as the first color attachment
      gl.TEXTURE_2D,
      this.texture.texture,
      0 // level, used to mipmaps, you can supply smaller levels or generate it with gl.generateMipmap
    );

    // this.texelSizeX = 1.0 / width
    // this.texelSizeY = 1.0 / height
  }

  resize(width: number, height: number) {
    this.texture.fill({ width, height });
  }

  attach(textureUnitIndex: number) {
    // purpose is to attached texture of the frame buffer to currently active program
    return this.texture.bind(textureUnitIndex);
  }
}
