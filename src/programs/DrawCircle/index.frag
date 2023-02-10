#version 300 es
precision mediump float; // in WebGL2 precision needs ot be only declared for floats
// you can define default or per variable precision

in vec4 vColor;
in vec2 vNormPos;

out vec4 fragColor;

float circle(in vec2 _st) {
  vec2 dist = _st - vec2(0.5);
  return 1.0 - smoothstep(
    0.99,
    1.01,
    dot(dist,dist)*4.0
  );
  // or we could just use length?
}

void main () {
  // vec2 st = gl_FragCoord.xy / 1939.0;
  // fragColor = vColor;
  // fragColor = vec4(vec3(vColor * circle(vNormPos, 0.9)), 1);
  fragColor = vColor * circle(vNormPos);
}