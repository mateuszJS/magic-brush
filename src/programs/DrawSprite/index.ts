import shaderVertexSource from "./index.vert";
import shaderFragmentSource from "./index.frag";
import { createAttribute, createAttrIndex } from "../utils/createAttribute";
import { compileShader } from "programs/utils/compileShader";
import { createProgram } from "programs/utils/createProgram";
import { getUniform } from "programs/utils/getUniform";
import { canvasMatrix } from "programs/canvasMatrix";

const texCoordDefault = new Float32Array([0, 0, 0, 1, 1, 1, 1, 0]);

// function getPosition(input: InputData['position']) {
//   const gl = window.gl
//   const [x, y, width, height] = input || [0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight]

//   return new Float32Array([
//     x, y,
//     x, y + height,
//     x + width, y + height,
//     x + width, y
//   ])
// }

const indexes = new Uint16Array([0, 1, 2, 0, 2, 3]);

interface InputData {
  // if any of value is not presented, then we assume we are rendering whole texture to a canvas
  texUnitIndex: number;
  texCoord?: Float32Array;
  position: Float32Array;
}

export default class DrawSprite {
  private program: WebGLProgram;
  private setPositionAttr: ReturnType<typeof createAttribute>;
  private setTexCoordAttr: ReturnType<typeof createAttribute>;
  private setAttrIndex: ReturnType<typeof createAttrIndex>;
  private texUniform: WebGLUniformLocation;
  private matrixUniform: WebGLUniformLocation;

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

    // speed up setting attribute with bindVertexArrayOES https://webglfundamentals.org/webgl/lessons/webgl-attributes.html
    this.setPositionAttr = createAttribute(gl, this.program, "a_position");
    this.setTexCoordAttr = createAttribute(gl, this.program, "a_texCoord");

    this.setAttrIndex = createAttrIndex(gl);

    this.texUniform = getUniform(this.program, "u_texture");
    this.matrixUniform = getUniform(this.program, "u_matrix");
  }

  setup(inputData: InputData, matrix: Matrix3 = canvasMatrix) {
    const gl = window.gl;
    gl.useProgram(this.program);
    gl.uniform1i(this.texUniform, inputData.texUnitIndex);
    gl.uniformMatrix3fv(this.matrixUniform, false, matrix);
    this.setPositionAttr(inputData.position);
    this.setTexCoordAttr(inputData.texCoord || texCoordDefault);
    this.setAttrIndex(indexes);
  }
}
