import glExt, { updateExtensions } from "../extensions";

export default function initWebGL2(canvas: HTMLCanvasElement) {
  const params: WebGLContextAttributes = {
    alpha: true,
    depth: false,
    stencil: false,
    antialias: false,
    preserveDrawingBuffer: false, // to preserve back buffer it from previous requestAnimationFrame
  };

  const gl = canvas.getContext("webgl2", params);

  if (!gl) {
    throw Error("No WebGL2 detected. We do support ONLY WebGL2");
  }

  updateExtensions(gl);

  gl.enable(gl.BLEND);
  // we assume we are working with pre-multiplied alpha textures
  // https://webglfundamentals.org/webgl/lessons/webgl-and-alpha.html
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  // gl.enable(gl.SCISSOR_TEST);

  // gl.enable(gl.BLEND);
  // we assume we are working with pre-multiplied alpha textures
  // https://webglfundamentals.org/webgl/lessons/webgl-and-alpha.html
  // gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  return gl;

  /*
  const maxSize = gl.getParameter(gl.MAX_TEXTURE_SIZE)
  console.log("max texture size: ", maxSize)

  const ext = gl.getExtension('OES_texture_float');
if (!ext) {
  alert('need OES_texture_float');
  return;
}
it will allow us to use gl.FLOAT as type(second to last param) of data in texture
but it's only useful when you are passing your own Float32Array as texture


// check we can render to floating point textures
const ext2 = gl.getExtension('WEBGL_color_buffer_float');
if (!ext2) {
  alert('Need WEBGL_color_buffer_float');
  return;
}


  const maxVertexShaderTextureUnits = gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS); // it can return 0, some device can allow only 0 textures in vertex shader
  const maxFragmentShaderTextureUnits = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);

  // check we can use textures in a vertex shader
if (gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS) < 1) {
  alert('Can not use textures in vertex shaders');
  return;
}


Fragment shader getting precise position of pixel:
 // compute texcoord from gl_FragCoord;
  vec2 texcoord = gl_FragCoord.xy / texDimensions;

  vec4 getValueFrom2DTextureAs1DArray(sampler2D tex, vec2 dimensions, float index) {
  float y = floor(index / dimensions.x);
  float x = mod(index, dimensions.x);
  vec2 texcoord = (vec2(x, y) + 0.5) / dimensions;
  return texture2D(tex, texcoord);
}
  */
}
