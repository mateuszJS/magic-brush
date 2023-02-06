#version 300 es

in vec2 a_position;
in vec2 a_texCoord;
// in float index
in float aOffsetDepth;
in float aOffsetX;

out vec3 v_texCoord;

uniform mat3 u_matrix;
uniform float uStartDepth;

void main () {
  v_texCoord = vec3(a_texCoord, uStartDepth + aOffsetDepth);
  gl_Position = vec4((u_matrix * vec3(a_position, 1)).xy + vec2(aOffsetX, 0), 0.0, 1.0);
}
