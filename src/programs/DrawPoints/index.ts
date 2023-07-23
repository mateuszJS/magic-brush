import shaderVertexSource from "./index.vert";
import shaderFragmentSource from "./index.frag";
import { setAttribute, setIndex } from "../utils/attributes";
import { compileShader } from "programs/utils/compileShader";
import { createProgram } from "programs/utils/createProgram";
import { getUniform } from "programs/utils/getUniform";
import linkProgram from "programs/utils/linkProgram";

const attrs = {
  aPoint: 0,
} as const;

export default class DrawPoints {
  private program: WebGLProgram;
  private matrixUniform: WebGLUniformLocation;
  private uColorUniform: WebGLUniformLocation;

  constructor() {
    const gl = window.gl;
    const vertexShader: WebGLShader = compileShader(
      gl.VERTEX_SHADER,
      shaderVertexSource //.replace("%RADIUS%", RADIUS.toFixed(1))
    );
    const fragmentShader: WebGLShader = compileShader(
      gl.FRAGMENT_SHADER,
      shaderFragmentSource
    );

    this.program = createProgram(gl, vertexShader, fragmentShader);

    Object.entries(attrs).forEach(([name, location]) => {
      gl.bindAttribLocation(this.program, location, name); // this bind attribute under specific location, needs to call just once per program
    });

    linkProgram(this.program);

    this.matrixUniform = getUniform(this.program, "uMatrix");
    this.uColorUniform = getUniform(this.program, "uColor");
  }

  public setup(matrix: Mat3, points: Point[], color: vec4) {
    const gl = window.gl;
    gl.useProgram(this.program);
    gl.uniformMatrix3fv(this.matrixUniform, false, matrix);
    gl.uniform4fv(this.uColorUniform, color);
    const serializedPoint = points.flatMap((p) => [p.x, p.y]);
    setAttribute(attrs.aPoint, 2, undefined, new Float32Array(serializedPoint));
  }
}
