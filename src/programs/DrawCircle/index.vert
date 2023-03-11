#version 300 es

in vec2 aPos;
in vec2 aVertOffset;
in vec2 aNormPos;
in vec4 aColor;

uniform mat3 uMatrix;

out vec4 vColor;
out vec2 vNormPos;

void main () {
  vColor = aColor;
  vNormPos = aNormPos;
  gl_Position = vec4((uMatrix * vec3(aPos + aVertOffset, 1)).xy, 0.0, 1.0);
}
