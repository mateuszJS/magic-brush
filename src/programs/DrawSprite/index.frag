#version 300 es
precision mediump float;
precision mediump sampler2D;

in highp vec2 v_texCoord;

uniform sampler2D u_texture;

out vec4 outputColor;

void main () {
    vec4 texel = texture(u_texture, v_texCoord);
    outputColor = vec4(texel.rgb, texel.a);
    // gl_FragColor = vec4(texel.rgb * texel.a, texel.a);
}