import "./styles.css";
import vertexShaderSource from "./index.vert";
import fragmentShaderSource from "./index.frag";
import compileShader from "./utils/WebGL/compileShader";
import createProgram from "./utils/WebGL/createProgram";
import createFullFrameCanvas from "./utils/createFullFrameCanvas";

const gl = createFullFrameCanvas();
const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = compileShader(
  gl,
  gl.FRAGMENT_SHADER,
  fragmentShaderSource
);

const program = createProgram(gl, vertexShader, fragmentShader);

const resolutionUniformLocation = gl.getUniformLocation(
  program,
  "u_resolution"
);
const colorUniformLocation = gl.getUniformLocation(program, "u_color");

const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
const positionBuffer = gl.createBuffer();

gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
/*
WebGL lets us manipulate many WebGL resources on global bind points.
You can think of bind points as internal global variables inside WebGL.
First you bind a resource to a bind point. Then, all other functions refer to the resource through the bind point.
So, let's bind the position buffer.
*/

// three 2d points
var positions = [10, 20, 80, 20, 10, 30, 10, 30, 80, 20, 80, 30];
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
//gl.STATIC_DRAW tells WebGL we are not likely to change this data much. - optimization reasons

/*
We need to tell WebGL how to convert from the clip space values
we'll be setting gl_Position to back into pixels, often called screen space.
To do this we call gl.viewport and pass it the current size of the canvas.
*/

gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

gl.clearColor(0, 0, 0, 0);
gl.clear(gl.COLOR_BUFFER_BIT);

gl.useProgram(program);

gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
gl.uniform4f(colorUniformLocation, 0, 0.8, 0.4, 1);

gl.enableVertexAttribArray(positionAttributeLocation);

// specify how ot pull the data
// Bind the position buffer.
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

// Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
var size = 2; // 2 components per iteration
var type = gl.FLOAT; // the data is 32bit floats
var normalize = false; // don't normalize the data
var stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
var offset = 0; // start at the beginning of the buffer
gl.vertexAttribPointer(
  positionAttributeLocation,
  size,
  type,
  normalize,
  stride,
  offset
);
/*
A hidden part of gl.vertexAttribPointer is that it binds the current ARRAY_BUFFER to the attribute.
In other words now this attribute is bound to positionBuffer.
That means we're free to bind something else to the ARRAY_BUFFER bind point.
The attribute will continue to use positionBuffer.
*/

var primitiveType = gl.TRIANGLES;
var offset = 0;
var count = 6;
gl.drawArrays(primitiveType, offset, count);
