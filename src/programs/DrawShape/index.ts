import shaderVertexSource from "./index.vert";
import shaderFragmentSource from "./index.frag";
import { setAttribute, setIndex } from "../utils/setAttribute";
import { compileShader } from "programs/utils/compileShader";
import { createProgram } from "programs/utils/createProgram";
import { getUniform } from "programs/utils/getUniform";
import { canvasMatrix } from "programs/canvasMatrix";
import linkProgram from "programs/utils/linkProgram";

// keys are attributes names, values are location
const attrs = {
  a_position: 0,
} as const;
// because all DrawSprite programs will share same attr locations, we can also share VAO

export default class DrawShape {
  private program: WebGLProgram;

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
  }

  // VAO - vertex array object
  // public createVAO(
  //   texCoord: Float32Array,
  //   position: Float32Array,
  //   depth: Float32Array,
  //   indexes: Uint16Array
  // ): WebGLVertexArrayObject {
  //   // if you are planning to use this

  //   // https://webgl2fundamentals.org/webgl/lessons/webgl1-to-webgl2.html

  //   const gl = window.gl;
  //   const vao = gl.createVertexArray();

  //   if (!vao) {
  //     throw Error(
  //       "Failed to create a vao. Seems like WebGL has lost the context"
  //     );
  //   }

  //   gl.bindVertexArray(vao);

  //   setAttribute(attrs.a_position, position, 8);
  //   setAttribute(attrs.a_texCoord, texCoord, 8);
  //   setAttribute(attrs.aDepth, depth, 4, 1);
  //   // if you will need to edit attributes, just bind the buffer and update the data!
  //   setIndex(indexes);

  //   gl.bindVertexArray(null);

  //   return vao;
  // }

  public setup() {
    const gl = window.gl;
    gl.useProgram(this.program);
  }
}