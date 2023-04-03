#version 300 es

in vec2 aPoint;

uniform mat3 uMatrix;

void main () {
  gl_Position = vec4((uMatrix * vec3(aPoint, 1)).xy, 0.0, 1.0);
  gl_PointSize = 10.0;
}
