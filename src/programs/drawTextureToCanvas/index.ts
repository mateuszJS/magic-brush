// import vertexShaderSource from "../index.vert";
// import fragmentShaderSource from "./index.frag";
// import createProgram from "programs/utils/createProgram";
// import uMat3 from "models/UMat3";
// import Attribute from "programs/utils/createAttribute";
// import { SIZE } from "index";
// import * as m3 from "utils/m3";
// import getRectCoords from "utils/getRectCoords";

// export default function setup(gl: WebGLRenderingContext) {
//   const program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
//   const matrixUniform = new uMat3(gl, program, "u_matrix");
//   const positionAttribute = new Attribute(gl, program, "a_position");
//   const texCoordAttribute = new Attribute(gl, program, "a_texCoord");

//   const projectionMatrix = m3.projection(SIZE, SIZE);

//   return (inputTexture: WebGLTexture) => {
//     gl.bindFramebuffer(gl.FRAMEBUFFER, null);

//     // render the cube with the texture we just rendered to
//     gl.bindTexture(gl.TEXTURE_2D, inputTexture);

//     // Tell WebGL how to convert from clip space to pixels
//     gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

//     // Clear the canvas AND the depth buffer.
//     gl.clearColor(0, 0, 0, 1); // clear to black

//     gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

//     gl.useProgram(program);

//     // provide texture coordinates for the rectangle.
//     texCoordAttribute.set([
//       0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0,
//     ]);

//     positionAttribute.set(getRectCoords(0, 0, SIZE, SIZE));

//     // Set the matrix.
//     matrixUniform.set(projectionMatrix);

//     var primitiveType = gl.TRIANGLES;
//     var offset = 0;
//     var count = 6;
//     gl.drawArrays(primitiveType, offset, count);
//   };
// }
