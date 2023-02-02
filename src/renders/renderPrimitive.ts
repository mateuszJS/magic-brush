export default function (gl: WebGL2RenderingContext, pointsNumber: number) {
  gl.drawArrays(gl.TRIANGLES, 0, pointsNumber);
}
