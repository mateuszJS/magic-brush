#version 300 es

in vec2 a_position;
in vec2 a_texCoord;

out vec2 v_texCoord;

uniform mat3 u_matrix;

void main () {
  v_texCoord = a_texCoord;
  gl_Position = vec4((u_matrix * vec3(a_position, 1)).xy, 0.0, 1.0);
}
