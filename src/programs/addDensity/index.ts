// import vertexShaderSource from "../index.vert";
// import fragmentShaderSource from "./index.frag";
// import createProgram from "programs/utils/createProgram";
// import uVec2 from "models/UVec2";
// import uMat3 from "models/UMat3";
// import Attribute from "programs/utils/createAttribute";
// import UVec2 from "models/UVec2";
// import { SIZE } from "index";
// import * as m3 from "utils/m3";
// import getRectCoords from "utils/getRectCoords";

// export default function setup(gl: WebGLRenderingContext) {
//   const program = createProgram(gl, vertexShaderSource, fragmentShaderSource);

//   const mouseCoordUniform = new uVec2(gl, program, "u_mouseCoord");
//   const matrixUniform = new uMat3(gl, program, "u_matrix");
//   const positionAttribute = new Attribute(gl, program, "a_position");
//   const texCoordAttribute = new Attribute(gl, program, "a_texCoord");
//   const textureSizeUniform = new UVec2(gl, program, "u_textureSize");
//   const projectionMatrix = m3.projection(SIZE, SIZE);
//   const renderBuffer = gl.createRenderbuffer();
//   const frameBuffer = gl.createFramebuffer();
//   gl.bindRenderbuffer(gl.RENDERBUFFER, renderBuffer);
//   gl.renderbufferStorage(gl.RENDERBUFFER, gl.RGBA4, SIZE, SIZE);

//   return (
//     inputTexture: WebGLTexture,
//     normMouseX: number,
//     normMouseY: number
//   ) => {
//     // set output as frame buffer, and as target in frame buffer use render buffer
//     gl.bindRenderbuffer(gl.RENDERBUFFER, renderBuffer);
//     gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
//     gl.framebufferRenderbuffer(
//       gl.FRAMEBUFFER, // in webgl2 more values are available
//       gl.COLOR_ATTACHMENT0,
//       gl.RENDERBUFFER,
//       renderBuffer
//     );
//     gl.viewport(0, 0, SIZE, SIZE);

//     // Clear the attachment(s).
//     gl.clearColor(0, 0, 0, 1); // clear to black
//     gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

//     // shader related things
//     //

//     gl.bindTexture(gl.TEXTURE_2D, inputTexture);

//     gl.useProgram(program);
//     texCoordAttribute.set([
//       0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0,
//     ]);
//     positionAttribute.set(getRectCoords(0, 0, SIZE, SIZE));
//     matrixUniform.set(projectionMatrix);
//     textureSizeUniform.set([SIZE, SIZE]);
//     mouseCoordUniform.set([normMouseX, normMouseY]);
//     gl.drawArrays(gl.TRIANGLES, 0, 6);
//     // what is "drawElements"?
//   };
// }
