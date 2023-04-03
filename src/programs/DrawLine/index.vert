#version 300 es

in vec2 pos;
in vec4 color;

uniform mat3 uMatrix;

out vec4 vColor;

void main () {
  vColor = color;
  gl_Position = vec4((uMatrix * vec3(pos, 1)).xy, 0.0, 1.0);
}
