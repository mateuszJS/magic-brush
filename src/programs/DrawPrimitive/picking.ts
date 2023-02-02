// import shaderFragmentSource from "./picking.frag";
// import DrawPrimitiveProgram, { InputData } from ".";
// import { getUniform } from "programs/utils/getUniform";
// import FrameBuffer from "models/FrameBuffer";
// import m3 from "utils/m3";

// interface InputDataWithId extends InputData {
//   id: [number, number, number];
// }

// const BUFFER_SIZE = 1;

// export default class DrawPrimitivePickingProgram extends DrawPrimitiveProgram {
//   private idUniform: WebGLUniformLocation;
//   private matrix: Matrix3;
//   private projectMatrix: Matrix3;
//   readonly frameBuffer: FrameBuffer;

//   constructor() {
//     super(shaderFragmentSource);

//     this.frameBuffer = new FrameBuffer();
//     this.frameBuffer.resize(BUFFER_SIZE, BUFFER_SIZE);

//     this.idUniform = getUniform(this.program, "u_id");
//     this.matrix = m3.identity(); // just any default valid value
//     this.projectMatrix = m3.projectionFlipY(BUFFER_SIZE, BUFFER_SIZE);
//   }

//   // Before we go anywhere else, firstly we need to optimize out picking strategy with this link
//   // https://webglfundamentals.org/webgl/lessons/webgl-picking.html

//   updateMatrix(x: number, y: number) {
//     this.matrix = m3.translate(this.projectMatrix, x, y);
//   }

//   setup(inputData: InputDataWithId) {
//     super.setup(inputData, this.matrix);
//     // super.setup(inputData, translate(this.matrix, inputData.x, inputData.y))
//     window.gl.uniform3fv(this.idUniform, inputData.id);
//   }
// }
