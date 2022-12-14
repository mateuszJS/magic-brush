import "./styles.css";
import vertexShaderSource from "./index.vert";
import fragmentShaderSource from "./index.frag";
import compileShader from "./utils/WebGL/compileShader";
import createProgram from "./utils/WebGL/createProgram";
import createFullFrameCanvas from "./utils/createFullFrameCanvas";
import * as m3 from "./utils/m3";
import uVec4 from "./models/UVec4";
import uMat3 from "./models/UMat3";
import Attribute from "./models/Attribute";

const gl = createFullFrameCanvas();
const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = compileShader(
  gl,
  gl.FRAGMENT_SHADER,
  fragmentShaderSource
);

const program = createProgram(gl, vertexShader, fragmentShader);
const colorUniform = new uVec4(gl, program, "u_color");
const matrixUniform = new uMat3(gl, program, "u_matrix");
const positionAttribute = new Attribute(gl, program, "a_position");

function drawScene(now: DOMHighResTimeStamp) {
  now *= 0.001; // convert to seconds

  // Tell WebGL how to convert from clip space to pixels
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // Clear the canvas.
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Tell it to use our program (pair of shaders)
  gl.useProgram(program);

  // Set Geometry.
  const radius = Math.hypot(gl.canvas.width, gl.canvas.height) * 0.5;
  const angle = now;
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;
  const centerX = gl.canvas.width / 2;
  const centerY = gl.canvas.height / 2;
  positionAttribute.set([centerX + x, centerY + y, centerX - x, centerY - y]);

  // Compute the matrices
  const projectionMatrix = m3.projection(gl.canvas.width, gl.canvas.height);

  // Set the matrix.
  matrixUniform.set(projectionMatrix);

  // Draw in red
  colorUniform.set([1, 0, 0, 1]);

  // Draw the geometry.
  const primitiveType = gl.LINES;
  const offset = 0;
  const count = 2;
  gl.drawArrays(primitiveType, offset, count);

  requestAnimationFrame(drawScene);
}

requestAnimationFrame(drawScene);

// // three 2d points
// var positions = [10, 20, 80, 20, 10, 30, 10, 30, 80, 20, 80, 30];
// gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
// //gl.STATIC_DRAW tells WebGL we are not likely to change this data much. - optimization reasons

// /*
// We need to tell WebGL how to convert from the clip space values
// we'll be setting gl_Position to back into pixels, often called screen space.
// To do this we call gl.viewport and pass it the current size of the canvas.
// */

// gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

// gl.clearColor(0, 0, 0, 0);
// gl.clear(gl.COLOR_BUFFER_BIT);

// gl.useProgram(program);

// gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
// gl.uniform4f(colorUniformLocation, 0, 0.8, 0.4, 1);

// gl.enableVertexAttribArray(positionAttributeLocation);

// // specify how ot pull the data
// // Bind the position buffer.
// gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

// // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
// var size = 2; // 2 components per iteration
// var type = gl.FLOAT; // the data is 32bit floats
// var normalize = false; // don't normalize the data
// var stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
// var offset = 0; // start at the beginning of the buffer
// gl.vertexAttribPointer(
//   positionAttributeLocation,
//   size,
//   type,
//   normalize,
//   stride,
//   offset
// );
// /*
// A hidden part of gl.vertexAttribPointer is that it binds the current ARRAY_BUFFER to the attribute.
// In other words now this attribute is bound to positionBuffer.
// That means we're free to bind something else to the ARRAY_BUFFER bind point.
// The attribute will continue to use positionBuffer.
// */

// var primitiveType = gl.TRIANGLES;
// var offset = 0;
// var count = 6;
// gl.drawArrays(primitiveType, offset, count);
