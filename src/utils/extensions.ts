interface Extension {
  internalFormat: GLint;
  format: GLenum;
}

interface WebGlExtensions {
  formatRGBA: Extension;
  formatRG: Extension;
  formatR: Extension;
  supportLinearFiltering: OES_texture_float_linear | null;
  isReady: boolean;
}

function getSupportedFormat(
  gl: WebGL2RenderingContext,
  internalFormat: GLint,
  format: GLenum,
  type: GLenum
): Extension {
  if (!supportRenderTextureFormat(gl, internalFormat, format, type)) {
    switch (internalFormat) {
      case gl.R16F:
        return getSupportedFormat(gl, gl.RG16F, gl.RG, type);
      case gl.RG16F:
        return getSupportedFormat(gl, gl.RGBA16F, gl.RGBA, type);
      default:
        throw Error("Seems like even gl.RGBA16F is not supported");
    }
  }

  return {
    internalFormat,
    format,
  };
}

function supportRenderTextureFormat(
  gl: WebGL2RenderingContext,
  internalFormat: GLint,
  format: GLenum,
  type: GLenum
) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, 4, 4, 0, format, type, null);

  const fbo = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    gl.COLOR_ATTACHMENT0,
    gl.TEXTURE_2D,
    texture,
    0
  );

  const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
  return status == gl.FRAMEBUFFER_COMPLETE;
}

const glExt: WebGlExtensions = {
  formatRGBA: { internalFormat: 0, format: 0 },
  formatRG: { internalFormat: 0, format: 0 },
  formatR: { internalFormat: 0, format: 0 },
  supportLinearFiltering: null,
  isReady: false,
};
export default glExt;

export function updateExtensions(gl: WebGL2RenderingContext) {
  // https://webglfundamentals.org/webgl/lessons/webgl-3d-textures.html
  gl.getExtension("EXT_color_buffer_float"); // you can render variety of floating point formats
  glExt.supportLinearFiltering = gl.getExtension("OES_texture_float_linear");
  // // if there is no extension, then webgl supports only NEAREST for TEXTURE_MIN_FILTER and TEXTURE_MAX_FILTER

  glExt.formatRGBA = getSupportedFormat(gl, gl.RGBA16F, gl.RGBA, gl.HALF_FLOAT);
  glExt.formatRG = getSupportedFormat(gl, gl.RG16F, gl.RG, gl.HALF_FLOAT);
  glExt.formatR = getSupportedFormat(gl, gl.R16F, gl.RED, gl.HALF_FLOAT);

  glExt.isReady = true;
}
