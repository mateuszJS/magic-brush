#version 300 es
precision mediump float; // in WebGL2 precision needs to be only declared for floats
// you can define default or per variable precision

uniform vec4 uColor;

out vec4 fragColor;

void main () {
  fragColor = uColor;
}