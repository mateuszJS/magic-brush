#version 300 es
precision mediump float; // in WebGL2 precision needs ot be only declared for floats
// you can define default or per variable precision
in float vTexCoorX;
in float vTexCoordY;

uniform mediump sampler2D uTex;

out vec4 fragColor;

void main () {
  vec4 texel = texture(uTex, vec2(vTexCoorX, vTexCoordY));
  fragColor = vec4(vTexCoordY / 10.0, texel.gb * texel.a, texel.a);
  // fragColor = vec4(vTexOffset, vT, 0, 1);
}
