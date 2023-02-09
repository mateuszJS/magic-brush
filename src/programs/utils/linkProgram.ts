export default function linkProgram(program: WebGLProgram) {
  const gl = window.gl;

  gl.linkProgram(program); // we have to do linking AFTER binding attributes to the specific locations
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.trace(gl.getProgramInfoLog(program));
    throw Error(
      "Linking program failed! I'm repeating! Linking program failed! Evacuation!"
    );
  }
}
