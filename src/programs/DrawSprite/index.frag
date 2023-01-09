  precision mediump float;
  precision mediump sampler2D;

  varying highp vec2 v_texCoord;

  uniform sampler2D u_texture;

  void main () {
      vec4 texel = texture2D(u_texture, v_texCoord);
      gl_FragColor = vec4(texel.rgb * texel.a, texel.a);
  }