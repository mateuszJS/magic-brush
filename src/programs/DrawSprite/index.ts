import shaderVertexSource from "./index.vert";
import shaderFragmentSource from "./index.frag";
import { setAttribute, setIndex } from "../utils/setAttribute";
import { compileShader } from "programs/utils/compileShader";
import { createProgram } from "programs/utils/createProgram";
import { getUniform } from "programs/utils/getUniform";
import linkProgram from "programs/utils/linkProgram";

// keys are attributes names, values are location
const attrs = {
  a_position: 0,
  a_texCoord: 1,
  aOffsetDepth: 2,
  aOffsetX: 3,
} as const;
// because all DrawSprite programs will share same attr locations, we can also share VAO

export default class DrawSprite {
  private program: WebGLProgram;
  private texUniform: WebGLUniformLocation;
  private matrixUniform: WebGLUniformLocation;
  private startDepth: WebGLUniformLocation;

  constructor() {
    const gl = window.gl;
    const vertexShader: WebGLShader = compileShader(
      gl.VERTEX_SHADER,
      shaderVertexSource
    );
    const fragmentShader: WebGLShader = compileShader(
      gl.FRAGMENT_SHADER,
      shaderFragmentSource
    );

    this.program = createProgram(gl, vertexShader, fragmentShader);
    Object.entries(attrs).forEach(([name, location]) => {
      gl.bindAttribLocation(this.program, location, name); // this bind attribute under specific location, needs to call just once per program
    });

    // after setting location of attributes we can link the program
    linkProgram(this.program);

    // speed up setting attribute with bindVertexArrayOES https://webglfundamentals.org/webgl/lessons/webgl-attributes.html

    this.texUniform = getUniform(this.program, "u_texture");
    this.matrixUniform = getUniform(this.program, "u_matrix");
    this.startDepth = getUniform(this.program, "uStartDepth");
  }

  // VAO - vertex array object
  public createVAO(
    texCoord: Float32Array,
    position: Float32Array,
    depth: Float32Array,
    offsetX: Float32Array,
    indexes: Uint16Array
  ): WebGLVertexArrayObject {
    // if you are planning to use this

    // https://webgl2fundamentals.org/webgl/lessons/webgl1-to-webgl2.html

    const gl = window.gl;
    const vao = gl.createVertexArray();

    if (!vao) {
      throw Error(
        "Failed to create a vao. Seems like WebGL has lost the context"
      );
    }

    gl.bindVertexArray(vao);

    setAttribute(attrs.a_position, position);
    setAttribute(attrs.a_texCoord, texCoord);
    setAttribute(attrs.aOffsetDepth, depth, 1);
    setAttribute(attrs.aOffsetX, offsetX, 1);
    setIndex(indexes);

    gl.vertexAttribDivisor(attrs.a_position, 0);
    gl.vertexAttribDivisor(attrs.a_texCoord, 0);
    gl.vertexAttribDivisor(attrs.aOffsetDepth, 1);
    gl.vertexAttribDivisor(attrs.aOffsetX, 1);

    gl.bindVertexArray(null);

    return vao;
  }

  public setup(
    vao: WebGLVertexArrayObject,
    texUnitIndex: number,
    matrix: Matrix3,
    startDepth: number
  ) {
    const gl = window.gl;
    gl.useProgram(this.program);
    gl.bindVertexArray(vao);
    gl.uniform1i(this.texUniform, texUnitIndex);
    gl.uniform1f(this.startDepth, startDepth);
    gl.uniformMatrix3fv(this.matrixUniform, false, matrix);
  }
}
