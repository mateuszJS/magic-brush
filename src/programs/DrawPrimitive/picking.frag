  precision mediump float;

  uniform vec3 u_id;

  void main () {
    // oncde we will render from texture, remember to make if
    // if(texel has alpha > 0) { render u_id } else { render vec(0) }
      gl_FragColor = vec4(u_id, 1.0);
  }