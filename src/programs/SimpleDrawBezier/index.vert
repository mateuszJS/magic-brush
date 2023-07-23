#version 300 es

in float t;
in float dir; // -1 or 1

uniform float uThick;

uniform mat3 uMatrix;

uniform vec2 p1;
uniform vec2 p2;
uniform vec2 p3;
uniform vec2 p4;

void main () {
  float t2 = t * t;
  float one_minus_t = 1.0 - t;
  float one_minus_t2 = one_minus_t * one_minus_t;
  vec2 pos = p1 * one_minus_t2 * one_minus_t + p2 * 3.0 * t * one_minus_t2 + p3 * 3.0 * t2 * one_minus_t + p4 * t2 * t;

  vec2 angle = one_minus_t2 * (p2 - p1) + 2.0 * t * one_minus_t * (p3 - p2) + t2 * (p4 - p3);
  vec2 angleNorm = normalize(angle) * uThick;
  vec2 transPos = vec2(pos.x - angleNorm.y * dir, pos.y + angleNorm.x * dir);

  gl_Position = vec4((uMatrix * vec3(transPos, 1)).xy, 0.0, 1.0);
}
