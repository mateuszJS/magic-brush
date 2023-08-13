import shaderVertexSource from "./index.vert";
import shaderFragmentSource from "./index.frag";
import { setAttribute, setIndex } from "../utils/attributes";
import { compileShader } from "programs/utils/compileShader";
import { createProgram } from "programs/utils/createProgram";
import { getUniform } from "programs/utils/getUniform";
import linkProgram from "programs/utils/linkProgram";
import normalizeVec2 from "utils/normalizeVec2";

const attrs = {
  pos: 0,
  color: 1,
} as const;

export default class DrawLine {
  private program: WebGLProgram;
  private matrixUniform: WebGLUniformLocation;
  private setPoints: (arrayBufferData: BufferSource) => void;
  private setColors: (arrayBufferData: BufferSource) => void;

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

    this.setPoints = setAttribute(attrs.pos, 2);
    this.setColors = setAttribute(attrs.color, 4);
    this.matrixUniform = getUniform(this.program, "uMatrix");
  }

  public setup(
    matrix: Mat3,
    p1: Point,
    p2: Point,
    startColor: vec4,
    endColor = startColor,
    width = 3, // it's actually half of line width
    additionalLength = 0
  ) {
    const gl = window.gl;
    gl.useProgram(this.program);
    gl.uniformMatrix3fv(this.matrixUniform, false, matrix);

    const directionTan = normalizeVec2({
      x: p2.x - p1.x,
      y: p2.y - p1.y,
    });

    // [-y, x], [y, -x]
    const offset = [
      -directionTan.y * width, // x
      directionTan.x * width, // y
      directionTan.y * width, // x
      -directionTan.x * width, // y
    ];

    const lengthModX = directionTan.x * additionalLength;
    const lengthModY = directionTan.y * additionalLength;

    const points = [
      p1.x + offset[0] - lengthModX,
      p1.y + offset[1] - lengthModY,
      p1.x + offset[2] - lengthModX,
      p1.y + offset[3] - lengthModY,
      //
      p2.x + offset[0] + lengthModX,
      p2.y + offset[1] + lengthModY,
      p2.x + offset[2] + lengthModX,
      p2.y + offset[3] + lengthModY,
    ];
    this.setPoints(new Float32Array(points));
    this.setColors(
      new Float32Array([...startColor, ...startColor, ...endColor, ...endColor])
    );
  }
}
