#version 300 es
precision mediump float;

in vec2 v_texCoord;

uniform mediump sampler2D u_texture;

out vec4 fragColor;

void main () {
    vec4 texel = texture(u_texture, v_texCoord);
    fragColor = texel;
}