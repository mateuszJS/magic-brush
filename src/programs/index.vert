// attribute vec2 a_position;

// uniform mat3 u_matrix;

// void main() {
//   // Multiply the position by the matrix.
//   gl_Position = vec4((u_matrix * vec3(a_position, 1)).xy, 0, 1);
// }

attribute vec2 a_position;
attribute vec2 a_texCoord;
varying vec2 v_texCoord;
uniform mat3 u_matrix;

void main() {
   // pass the texCoord to the fragment shader
   // The GPU will interpolate this value between points
   v_texCoord = a_texCoord;
   gl_Position = vec4((u_matrix * vec3(a_position, 1)).xy, 0, 1);
}