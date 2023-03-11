import shaderVertexSource from "./index.vert";
import shaderFragmentSource from "./index.frag";
import pickShaderFragmentSource from "./pick.frag";
import { setAttribute, setIndex } from "../utils/attributes";
import { compileShader } from "programs/utils/compileShader";
import { createProgram } from "programs/utils/createProgram";
import { getUniform } from "programs/utils/getUniform";
import linkProgram from "programs/utils/linkProgram";

interface EditableVao {
  vao: WebGLVertexArrayObject;
  setColor: (colors: BufferSource) => void;
  setPos: (data: BufferSource) => void;
}

const attrs = {
  aVertOffset: 0,
  aNormPos: 2,
  aColor: 1,
  aPos: 3,
} as const;

const RADIUS = 30;
const INDEXES = new Uint16Array([0, 1, 2, 1, 2, 3]);
const VERTICES_OFFSET = [
  -RADIUS,
  -RADIUS,
  -RADIUS,
  +RADIUS,
  +RADIUS,
  -RADIUS,
  +RADIUS,
  +RADIUS,
];
const NORMS = [0, 0, 0, 1, 1, 0, 1, 1];

export default class DrawCircle {
  private program: WebGLProgram;
  private matrixUniform: WebGLUniformLocation;

  constructor(isPicking: boolean) {
    const gl = window.gl;
    const vertexShader: WebGLShader = compileShader(
      gl.VERTEX_SHADER,
      shaderVertexSource //.replace("%RADIUS%", RADIUS.toFixed(1))
    );
    const fragmentShader: WebGLShader = compileShader(
      gl.FRAGMENT_SHADER,
      isPicking ? pickShaderFragmentSource : shaderFragmentSource
    );

    this.program = createProgram(gl, vertexShader, fragmentShader);

    Object.entries(attrs).forEach(([name, location]) => {
      gl.bindAttribLocation(this.program, location, name); // this bind attribute under specific location, needs to call just once per program
    });

    linkProgram(this.program);

    this.matrixUniform = getUniform(this.program, "uMatrix");
  }

  // VAO - vertex array object
  public createVAO(): EditableVao {
    const gl = window.gl;
    const vao = gl.createVertexArray();

    if (!vao) {
      throw Error(
        "Failed to create a vao. Seems like WebGL has lost the context"
      );
    }

    gl.bindVertexArray(vao);

    setAttribute(
      attrs.aVertOffset,
      2,
      "vertex",
      new Float32Array(VERTICES_OFFSET)
    );
    setAttribute(attrs.aNormPos, 2, "vertex", new Float32Array(NORMS));
    const setColor = setAttribute(attrs.aColor, 4, "instance");
    const setPos = setAttribute(attrs.aPos, 2, "instance");
    setIndex(INDEXES);

    gl.bindVertexArray(null);

    return {
      vao,
      setColor,
      setPos,
    };
  }

  public setup(editVao: EditableVao, matrix: Mat3) {
    const gl = window.gl;
    gl.useProgram(this.program);
    gl.bindVertexArray(editVao.vao);
    gl.uniformMatrix3fv(this.matrixUniform, false, matrix);
  }
}
var done = false;
