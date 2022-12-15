precision mediump float;
 
// our texture
uniform sampler2D u_image;
uniform vec2 u_textureSize;

// the texCoords passed in from the vertex shader.
varying vec2 v_texCoord;
 
void main() {
  vec2 onePixel = vec2(1.0, 1.0) / u_textureSize;

   // Look up a color from the texture.
   gl_FragColor = texture2D(u_image, v_texCoord).brga;

    //  gl_FragColor = (
    //    texture2D(u_image, v_texCoord) +
    //    texture2D(u_image, v_texCoord + vec2(onePixel.x, 0.0) * 10.0 ) +
    //    texture2D(u_image, v_texCoord + vec2(-onePixel.x, 0.0) * 10.0 )) / 3.0;
}