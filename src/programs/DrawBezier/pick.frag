#version 300 es
precision mediump float; // in WebGL2 precision needs ot be only declared for floats
// you can define default or per variable precision
in float vTexCoorX;
in float vTexCoordY;

uniform mediump sampler2D uTex;

out vec4 fragColor;

void main () {
  vec4 texel = texture(uTex, vec2(vTexCoorX, vTexCoordY));
  // fragColor = vec4(0, 1, 0, 1);
  fragColor = vec4(vTexCoorX, vTexCoordY, 1.0, 1.0);
}
// https://stackoverflow.com/questions/45571488/webgl-2-readpixels-on-framebuffers-with-float-textures