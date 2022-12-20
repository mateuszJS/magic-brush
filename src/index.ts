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
import initControlPanel from "./utils/ui/initControlPanel";
import lennaImg from "./assets/lenna.png";
import Texture from "./models/Texture";
import UVec2 from "./models/UVec2";
import plasmaVideo from "./assets/plasma.mp4";
import setupVideo from "./utils/setupVideo";

function main() {
  // const image = new Image();
  // image.src = lennaImg;
  // image.onload = function () {
  //   render(image);
  // };

  setupVideo(plasmaVideo, render);
}

function render(img: HTMLImageElement | HTMLVideoElement) {
  const canvasNode = createFullFrameCanvas();
  initControlPanel(canvasNode);
  const gl = canvasNode.getContext("webgl");
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = compileShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource
  );

  const program = createProgram(gl, vertexShader, fragmentShader);
  // const colorUniform = new uVec4(gl, program, "u_color");
  const matrixUniform = new uMat3(gl, program, "u_matrix");
  const shiftUniform = new UVec2(gl, program, "u_shift");
  const positionAttribute = new Attribute(gl, program, "a_position");
  const texCoordAttribute = new Attribute(gl, program, "a_texCoord");
  const lenaTexture = new Texture(gl, img);
  const textureSizeUniform = new UVec2(gl, program, "u_textureSize");

  const imgWidth = 1000 || img.width;
  const imgHeight = 600 || img.height;

  function drawScene(now: DOMHighResTimeStamp) {
    now *= 0.001; // convert to seconds

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Clear the canvas.
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);

    lenaTexture.update();

    // provide texture coordinates for the rectangle.
    texCoordAttribute.set([
      0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0,
    ]);

    // Set Geometry.
    // const radius = Math.hypot(gl.canvas.width, gl.canvas.height) * 0.5;
    // const angle = now;
    // const x = Math.cos(angle) * radius;
    // const y = Math.sin(angle) * radius;
    // const centerX = gl.canvas.width / 2;
    // const centerY = gl.canvas.height / 2;
    positionAttribute.set(getRectangle(gl, 0, 0, imgWidth, imgHeight));

    // positionAttribute.set([centerX + x, centerY + y, centerX - x, centerY - y]);

    // Compute the matrices
    const projectionMatrix = m3.projection(gl.canvas.width, gl.canvas.height);

    // Set the matrix.
    matrixUniform.set(projectionMatrix);
    shiftUniform.set([Math.sin(now * 2), Math.cos(now * 2)]);
    textureSizeUniform.set([imgWidth, imgHeight]);

    // Draw in red
    // colorUniform.set([1, 0, 0, 1]);

    // Draw the geometry.
    // const primitiveType = gl.LINES;
    // const offset = 0;
    // const count = 2;
    // gl.drawArrays(primitiveType, offset, count);

    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    var count = 6;
    gl.drawArrays(primitiveType, offset, count);

    requestAnimationFrame(drawScene);
  }
  requestAnimationFrame(drawScene);
}

main();

function getRectangle(
  gl: WebGLRenderingContext,
  x: number,
  y: number,
  width: number,
  height: number
) {
  var x1 = x;
  var x2 = x + width;
  var y1 = y;
  var y2 = y + height;
  return [x1, y1, x2, y1, x1, y2, x1, y2, x2, y1, x2, y2];
}
