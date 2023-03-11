#version 300 es
precision mediump float; // in WebGL2 precision needs ot be only declared for floats
// you can define default or per variable precision

// precision mediump sampler2D;

in vec3 v_texCoord;

uniform mediump sampler2DArray u_texture;

out vec4 fragColor;

void main () {
    vec4 texel = texture(u_texture, v_texCoord);
    fragColor = vec4(texel.rg, 0, texel.a);
}