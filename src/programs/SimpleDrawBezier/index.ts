import shaderVertexSource from "./index.vert";
import shaderFragmentSource from "./index.frag";
import { setAttribute, setIndex } from "../utils/attributes";
import { compileShader } from "programs/utils/compileShader";
import { createProgram } from "programs/utils/createProgram";
import { getUniform } from "programs/utils/getUniform";
import linkProgram from "programs/utils/linkProgram";

interface EditableVao {
  vao: WebGLVertexArrayObject;
}

const attrs = {
  t: 0,
  dir: 1,
} as const;

export default class SimpleDrawBezier {
  private program: WebGLProgram;
  private matrixUniform: WebGLUniformLocation;
  private p1Uniform: WebGLUniformLocation;
  private p2Uniform: WebGLUniformLocation;
  private p3Uniform: WebGLUniformLocation;
  private p4Uniform: WebGLUniformLocation;
  private uThickUniform: WebGLUniformLocation;
  private uColor: WebGLUniformLocation;

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
    this.p1Uniform = getUniform(this.program, "p1");
    this.p2Uniform = getUniform(this.program, "p2");
    this.p3Uniform = getUniform(this.program, "p3");
    this.p4Uniform = getUniform(this.program, "p4");
    this.uThickUniform = getUniform(this.program, "uThick");
    this.uColor = getUniform(this.program, "uColor");
  }

  // VAO - vertex array object
  public createVAO(iter: number): EditableVao {
    const gl = window.gl;
    const vao = gl.createVertexArray();

    if (!vao) {
      throw Error(
        "Failed to create a vao. Seems like WebGL has lost the context"
      );
    }

    gl.bindVertexArray(vao);
    const middleTLength = iter - 2;
    const middleT = Array.from(
      { length: middleTLength },
      (_, i) => i / (middleTLength - 1)
    );
    const t = [0, ...middleT, 1];
    setAttribute(attrs.t, 1, undefined, new Float32Array(t));

    const dir = t.map((_, i) => (i % 2 ? 1 : -1));
    setAttribute(attrs.dir, 1, undefined, new Float32Array(dir));

    // we assume that we are going to use gl.TRIANGLE_STRIP
    gl.bindVertexArray(null);

    return {
      vao,
    };
  }

  public setup(
    editVao: EditableVao,
    matrix: Mat3,
    p1: Point,
    p2: Point,
    p3: Point,
    p4: Point,
    color: vec4
  ) {
    const gl = window.gl;
    gl.useProgram(this.program);
    gl.bindVertexArray(editVao.vao);
    gl.uniformMatrix3fv(this.matrixUniform, false, matrix);
    gl.uniform2f(this.p1Uniform, p1.x, p1.y);
    gl.uniform2f(this.p2Uniform, p2.x, p2.y);
    gl.uniform2f(this.p3Uniform, p3.x, p3.y);
    gl.uniform2f(this.p4Uniform, p4.x, p4.y);
    gl.uniform1f(this.uThickUniform, 20);
    gl.uniform4fv(this.uColor, color);
  }
}
