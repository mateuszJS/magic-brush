#version 300 es
precision mediump float; // in WebGL2 precision needs ot be only declared for floats
// you can define default or per variable precision

// precision mediump sampler2D;

out vec4 fragColor;

void main () {
    fragColor = vec4(1, 0, 0, 1);
    // gl_FragColor = vec4(texel.rgb * texel.a, texel.a);
}