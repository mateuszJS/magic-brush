import shaderVertexSource from "./index.vert";
import shaderFragmentSource from "./index.frag";
import shaderFragmentSourcePick from "./pick.frag";
import { setAttribute, setIndex } from "../utils/attributes";
import { compileShader } from "programs/utils/compileShader";
import { createProgram } from "programs/utils/createProgram";
import { getUniform } from "programs/utils/getUniform";
import linkProgram from "programs/utils/linkProgram";

interface EditableVao {
  vao: WebGLVertexArrayObject;
  updateTexCoordY(getTexCoordY: (t: number) => number): void;
}

const attrs = {
  t: 0,
  dir: 1,
  aTexCoorX: 2,
  aThick: 3,
  aTexCoorY: 4,
} as const;

export default class DrawBezier {
  private program: WebGLProgram;
  private matrixUniform: WebGLUniformLocation;
  private p1Uniform: WebGLUniformLocation;
  private p2Uniform: WebGLUniformLocation;
  private p3Uniform: WebGLUniformLocation;
  private p4Uniform: WebGLUniformLocation;
  private texUniform: WebGLUniformLocation;
  private prevTUniform: WebGLUniformLocation | null;

  constructor(isPick: boolean) {
    const gl = window.gl;
    const vertexShader: WebGLShader = compileShader(
      gl.VERTEX_SHADER,
      isPick
        ? shaderVertexSource.replace("//#define PICK", "#define PICK")
        : shaderVertexSource
    );

    const fragmentShader: WebGLShader = compileShader(
      gl.FRAGMENT_SHADER,
      isPick ? shaderFragmentSourcePick : shaderFragmentSource
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
    this.texUniform = getUniform(this.program, "uTex");
    this.prevTUniform = isPick ? getUniform(this.program, "uPrevT") : null;
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
    // iter needs to be even
    const halfIter = iter / 2;

    const t = Array.from({ length: halfIter }, (_, i) => i / (halfIter - 1));
    t[1] = 0; // two points of first triangle needs to be at 0, otherwise line instead looking like this  □=======□ looks like <========>
    t[t.length - 2] = 1; // same here, two last point of last triangle needs to be 1
    setAttribute(
      attrs.t,
      1,
      undefined,
      new Float32Array([...t, ...t.reverse()])
    );

    const dir1 = Array.from({ length: halfIter }, (_, i) => (i % 2 ? 1 : 0));
    const dir2 = Array.from({ length: halfIter }, (_, i) => (i % 2 ? -1 : 0));
    setAttribute(attrs.dir, 1, undefined, new Float32Array([...dir1, ...dir2]));

    const thickness = t.map((_t) => Math.max(1, 1 - Math.abs(_t - 0.5) * 2));
    setAttribute(
      attrs.aThick,
      1,
      undefined,
      new Float32Array([...thickness, ...thickness.reverse()])
    );

    const texCoordsY = Array.from({ length: halfIter }, (_, i) =>
      i % 2 ? 0 : 0.5
    );
    const texCoordsYReverse = Array.from({ length: halfIter }, (_, i) =>
      i % 2 ? 1 : 0.5
    );
    setAttribute(
      attrs.aTexCoorX,
      1,
      undefined,
      new Float32Array([...texCoordsY, ...texCoordsYReverse])
    );

    const updateTexCoordY = setAttribute(
      attrs.aTexCoorY,
      1,
      undefined,
      new Float32Array([...t, ...t.reverse()])
    );

    // we assume that we are going to use gl.TRIANGLE_STRIP
    gl.bindVertexArray(null);

    return {
      vao,
      updateTexCoordY(getTexCoordY) {
        const coordsY = t.map((_t) => getTexCoordY(_t));
        updateTexCoordY(new Float32Array([...coordsY, ...coordsY.reverse()]));
      },
    };
  }

  public setup(
    editVao: EditableVao,
    matrix: Mat3,
    p1: Point,
    p2: Point,
    p3: Point,
    p4: Point,
    texUnit: number,
    prevT: number
  ) {
    const gl = window.gl;
    gl.useProgram(this.program);
    gl.bindVertexArray(editVao.vao);
    gl.uniformMatrix3fv(this.matrixUniform, false, matrix);
    gl.uniform2f(this.p1Uniform, p1.x, p1.y);
    gl.uniform2f(this.p2Uniform, p2.x, p2.y);
    gl.uniform2f(this.p3Uniform, p3.x, p3.y);
    gl.uniform2f(this.p4Uniform, p4.x, p4.y);
    gl.uniform1i(this.texUniform, texUnit); // not needed for picking, only for rendering spline
    if (this.prevTUniform !== null) {
      gl.uniform1f(this.prevTUniform, prevT); // not needed for rendering spline, only for picking
    }
  }
}
