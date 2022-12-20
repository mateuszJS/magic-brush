precision mediump float;
 
// our texture
uniform sampler2D u_image;
uniform vec2 u_textureSize;
uniform vec4 u_color;

// the texCoords passed in from the vertex shader.
varying vec2 v_texCoord;
 
void main() {
  vec2 onePixel = vec2(1.0, 1.0) / u_textureSize;

  //  Look up a color from the texture.
  //  gl_FragColor = u_color;
   gl_FragColor = vec4(texture2D(u_image, v_texCoord).rgb, 1.0);
  //  gl_FragColor = vec4(texture2D(u_image, v_texCoord).rgb + u_color.rgb, 1);

    //  gl_FragColor = texture2D(u_image, v_texCoord + vec2(onePixel.x, 0.0) * u_shift.x * 100.0);

    //  gl_FragColor = (
    //    texture2D(u_image, v_texCoord).gbra +
    //    texture2D(u_image, v_texCoord + vec2(onePixel.x, onePixel.x) * u_shift * 30.0 ).brga +
    //    texture2D(u_image, v_texCoord + vec2(-onePixel.x, -onePixel.x) * u_shift * 30.0 ).rgba) / 3.0;
}