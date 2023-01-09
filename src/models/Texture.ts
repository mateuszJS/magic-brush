export default class Texture {
  private _width?: number;
  private _height?: number;
  private aspect?: number;
  readonly texture: WebGLTexture;

  constructor(private gl: WebGL2RenderingContext) {
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

  fill(input: { width: number; height: number } | HTMLImageElement) {
    const gl = this.gl;
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
          null
        );
      }
    } else {
      throw Error("Texture was not filled with any data!");
    }

    this._width = input.width;
    this._height = input.height;
    this.aspect = input.height / input.width;
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

  get width() {
    if (!this._width) {
      throw Error("Texture has no width specified");
    }

    return this._width;
  }

  get height() {
    if (!this._height) {
      throw Error("Texture has no height specified");
    }

    return this._height;
  }

  bind(textureUnitIndex: number) {
    const gl = this.gl;
    gl.activeTexture(gl.TEXTURE0 + textureUnitIndex);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    // we are returning index, so we can pass it further for example to program's uniform, to attach the texture to the correct sampler
    return textureUnitIndex;
  }

  getPosition(x: number, y: number, width: number, pivotX = 0.5, pivotY = 0.5) {
    if (!this.aspect) {
      throw Error(
        "Texture has no aspect ratio. Method .fill(input) was not called."
      );
    }
    // from login point of view, I'm not sure if this method should be part of texture class
    // but it's very convenient for us to set a program's attributes
    const height = this.aspect * width;

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
