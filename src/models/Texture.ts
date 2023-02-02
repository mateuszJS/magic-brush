import FrameBuffer from "./FrameBuffer";

function getPixels(length: number, color: vec4) {
  const values = Array.from(
    { length: length * 4 },
    (_, index) => color[index % 4] * 255
  );

  return new Uint8Array(values);
}

export default class Texture {
  private _width?: number;
  private _height?: number;
  private _aspect?: number;
  readonly texture: WebGLTexture;

  constructor() {
    const gl = window.gl;
    const newTexture = gl.createTexture();
    if (!newTexture) {
      throw Error(
        "gl.createTexture return null! Probably WebGL context is lost"
      );
    }
    this.texture = newTexture;

    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    // is supportLinearFiltering = false then webgl only supports gl.NEAREST
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  }

  fill(
    input:
      | { width: number; height: number; color: vec4 }
      | HTMLImageElement
      | { html: HTMLVideoElement; width: number; height: number }
      | FrameBuffer
  ) {
    const gl = window.gl;
    gl.bindTexture(gl.TEXTURE_2D, this.texture);

    if ("nodeName" in input) {
      // it's HTMLImageElement
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        input
        // gl.TEXTURE_2D, 0, glExt.formatRGBA.internalFormat, glExt.formatRGBA.format, gl.HALF_FLOAT, input.image
        // gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, input.image
        // glExt.formatRGBA.internalFormat, glExt.formatRGBA.format, gl.HALF_FLOAT
        // return getSupportedFormat(gl, gl.RG16F, gl.RG, type);
        // return getSupportedFormat(gl, gl.RGBA16F, gl.RGBA, type);
      );
    } else if ("html" in input) {
      // it's a video!
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        input.width,
        input.height,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        input.html
        // gl.TEXTURE_2D, 0, glExt.formatRGBA.internalFormat, glExt.formatRGBA.format, gl.HALF_FLOAT, input.image
        // gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, input.image
        // glExt.formatRGBA.internalFormat, glExt.formatRGBA.format, gl.HALF_FLOAT
        // return getSupportedFormat(gl, gl.RG16F, gl.RG, type);
        // return getSupportedFormat(gl, gl.RGBA16F, gl.RGBA, type);
      );
    } else if ("frameBufferLocation" in input) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, input.frameBufferLocation);
      gl.copyTexImage2D(gl.TEXTURE_2D, 0, gl.RGB, 0, 0, 100, 100, 0);

      this._width = input.texture.width;
      this._height = input.texture.height;
      this._aspect = input.texture.width / input.texture.height;

      return; // frameBuffer has special case fo filling size, what is handled above
    } else if (input.width && input.height) {
      if (input.width !== this._width || input.height !== this._height) {
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          input.width,
          input.height,
          0,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          getPixels(input.width * input.height, input.color)
          // null
        );
      }
    } else {
      throw Error("Texture was not filled with any data!");
    }

    /*
            video.addEventListener( "loadedmetadata", function () {
            // retrieve dimensions
            const height = this.videoHeight;
            const width = this.videoWidth;

            // send back result
            resolve({height, width});
        }, false);
        */
    this._width = input.width;
    this._height = input.height;
    this._aspect = input.width / input.height;
    /*
    // fill texture with 3x2 pixels
    const level = 0;
    const internalFormat = gl.LUMINANCE;
    const width = 3;
    const height = 2;
    const border = 0;
    const format = gl.LUMINANCE;
    const type = gl.UNSIGNED_BYTE;
    const data = new Uint8Array([
      128,  64, 128,
        0, 192,   0,
    ]);
    or data like this(just size of texture is bigger):
        new Uint8Array([
      0xDD, 0x99, 0xDD, 0xAA,
      0x88, 0xCC, 0x88, 0xDD,
      0xCC, 0x88, 0xCC, 0xAA,
      0x88, 0xCC, 0x88, 0xCC,
    ]),


    // WebGL copy pixels data faster if it's 2, 4 or 8 bytes at row. In our case it's 2 rows of THREE
    // so we are getting the error "WebGL: INVALID_OPERATION: texImage2D: ArrayBufferView not big enough for request"
    // WebGL by default reads 4 bytes per pixel except last row(3 in our case). So it reads 4+3 = 7, but we provided 6 values
    // To fix it we can tell webGL to read 1 byte at a time by doing this:
    const alignment = 1; // valid arguments are 1, 2, 4, 8
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, alignment);

    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border,
                  format, type, data);

WebGL1 supports following formats:
Format	          Type	                  Channels	Bytes per pixel
RGBA	            UNSIGNED_BYTE	          4	        4
RGB	              UNSIGNED_BYTE	          3	        3
RGBA	            UNSIGNED_SHORT_4_4_4_4	4	        2
RGBA  	          UNSIGNED_SHORT_5_5_5_1	4	        2
RGB	              UNSIGNED_SHORT_5_6_5	  3	        2
LUMINANCE_ALPHA	  UNSIGNED_BYTE	          2	        2
LUMINANCE	        UNSIGNED_BYTE	          1	        1
ALPHA	            UNSIGNED_BYTE	          1	        1

    */

    /*
gl.readPixels(
    pixelX,            // x
    pixelY,            // y
    1,                 // width
    1,                 // height
    gl.RGBA,           // format
    gl.UNSIGNED_BYTE,  // type
    data);             // typed array to hold result
*/
  }

  get aspect() {
    if (!this._aspect) {
      throw Error(
        "Texture aspect ratio was not specified. Probably method .fill() has not been called yet."
      );
    }

    return this._aspect;
  }

  get width() {
    if (!this._width) {
      throw Error(
        "Texture width was not specified. Probably method .fill() has not been called yet."
      );
    }

    return this._width;
  }

  get height() {
    if (!this._height) {
      throw Error(
        "Texture height was not specified. Probably method .fill() has not been called yet."
      );
    }

    return this._height;
  }

  // public copy(target: Texture) {
  //   const gl = window.gl;

  //   gl.bindTexture(gl.TEXTURE_2D, this.texture);

  //   gl.TEXTURE_2D,
  //   0,
  //   gl.RGBA,
  //   input.width,
  //   input.height,
  //   0,
  //   gl.RGBA,
  //   gl.UNSIGNED_BYTE,
  //   input.html

  //   gl.copyTexImage2D(target, level, internalformat, x, y, width, height, border)
  // }

  public bind(textureUnitIndex: number) {
    const gl = window.gl;

    gl.activeTexture(gl.TEXTURE0 + textureUnitIndex);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    // we are returning index, so we can pass it further for example to program's uniform, to attach the texture to the correct sampler
    return textureUnitIndex;
  }

  public getPosition(
    x: number,
    y: number,
    width: number,
    pivotX = 0.5,
    pivotY = 0.5
  ) {
    // from login point of view, I'm not sure if this method should be part of texture class
    // but it's very convenient for us to set a program's attributes
    const height = (1 / this.aspect) * width;

    return new Float32Array([
      x - width * pivotX,
      y - height * pivotY,
      x - width * pivotX,
      y + height * (1 - pivotY),
      x + width * (1 - pivotX),
      y + height * (1 - pivotY),
      x + width * (1 - pivotX),
      y - height * pivotY,
    ]);
  }
}
