precision mediump float;
 
uniform sampler2D u_image;
uniform vec2 u_textureSize;
uniform vec2 u_mouseCoord;
uniform vec2 u_velocity;

// the texCoords passed in from the vertex shader.
varying vec2 v_texCoord;
 
void main() {
  vec2 onePixel = vec2(1.0, 1.0) / u_textureSize;
  if (abs(u_mouseCoord.x - v_texCoord.x) < onePixel.x && abs(u_mouseCoord.y - v_texCoord.y) < onePixel.y) {
   gl_FragColor = vec4(u_velocity.x, u_velocity.y, 0, 1);
  } else {
   gl_FragColor = texture2D(u_image, v_texCoord);

  }
}
