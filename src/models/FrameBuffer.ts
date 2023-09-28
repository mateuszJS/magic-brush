import Texture from "./Texture";

export default class FrameBuffer {
  readonly texture: Texture;
  readonly frameBufferLocation: WebGLFramebuffer;

  constructor(texture?: Texture) {
    const gl = window.gl;
    // not sure if texture should be here, or should it be passed from arguments
    // also most of this constructor should be actually in render or attach
    this.texture = texture || new Texture();

    const newFrameBuffer = gl.createFramebuffer();
    if (!newFrameBuffer) {
      throw Error(
        "gl.createFramebuffer return null! Probably WebGL context is lost"
      );
    }

    this.frameBufferLocation = newFrameBuffer;

    this.texture.bind(0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBufferLocation);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0, // attach the texture as the first color attachment
      gl.TEXTURE_2D,
      this.texture.texture,
      0 // level
    );

    // Uncomment if you want to check if rendering process ended successfully
    // const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    // console.log(
    //   "Frame buffer class",
    //   status,
    //   status == gl.FRAMEBUFFER_COMPLETE
    // );
  }

  resize(width: number, height: number) {
    this.texture.fill({ width, height, color: [0, 0, 1, 1] });
  }

  attach(textureUnitIndex: number) {
    // purpose is to attached texture of the frame buffer to currently active program
    return this.texture.bind(textureUnitIndex);
  }
}
