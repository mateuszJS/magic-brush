export default function renderSprite() {
  const gl = window.gl;
  // CHECK_FRAMEBUFFER_STATUS(); not sure why si was commented out
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
  // https://webglsamples.org/sprites/readme.html
  // https://groups.google.com/g/webgl-dev-list/c/fO9IOv9AFf8

  /*
  index types:
  gl.UNSIGNED_BYTE where you can only have indices from 0 to 255, and,
  gl.UNSIGNED_SHORT where the maximum index is 65535.
  There is an extension, OES_element_index_uint you can check for and enable which allows gl.UNSIGNED_INT and indices up to 4294967296.
  */
}
