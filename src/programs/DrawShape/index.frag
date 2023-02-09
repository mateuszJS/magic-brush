#version 300 es
precision mediump float; // in WebGL2 precision needs ot be only declared for floats
// you can define default or per variable precision

uniform mediump sampler2D u_texture;

in vec2 v_texCoord;

out vec4 fragColor;

void main () {
  vec4 texel = texture(u_texture, v_texCoord);
    fragColor = texel;
    // gl_FragColor = vec4(texel.rgb * texel.a, texel.a);
}