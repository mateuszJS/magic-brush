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
import TextureSolidFill from "./models/TextureSolidFill";

const SIZE = 256;
let dt = 1;
const diffusion = 0;
const viscosity = 0;

function main() {
  // const image = new Image();
  // image.src = lennaImg;
  // image.onload = function () {
  //   render(image);
  // };

  setupVideo(plasmaVideo, render);
}

function render(img: HTMLImageElement | HTMLVideoElement) {
  const canvasNode = createFullFrameCanvas(SIZE, SIZE);
  initControlPanel(canvasNode);
  const gl = canvasNode.getContext("webgl");
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
  const texCoordAttribute = new Attribute(gl, program, "a_texCoord");
  const lenaTexture = new Texture(gl, SIZE, SIZE);
  const solidFillTexture = new TextureSolidFill(gl, SIZE, SIZE);
  const textureSizeUniform = new UVec2(gl, program, "u_textureSize");

  function setOutputToLenaTexture() {
    lenaTexture.setAsOutput();
    gl.bindTexture(gl.TEXTURE_2D, solidFillTexture.texture);
    // render the cube with the texture we just rendered to
  }

  function setOutputToCanvas() {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    // render the cube with the texture we just rendered to
    gl.bindTexture(gl.TEXTURE_2D, lenaTexture.texture);

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Clear the canvas AND the depth buffer.
    gl.clearColor(1, 1, 1, 1); // clear to white
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }
  let time = 0;
  function drawScene(now: DOMHighResTimeStamp) {
    now *= 0.001; // convert to seconds

    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);

    // lenaTexture.update();

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

    // if (time === 0) {
    positionAttribute.set(
      getRectangle(gl, SIZE / 3, SIZE / 3, SIZE / 3, SIZE / 3)
    );
    // } else {
    //   positionAttribute.set(
    //     getRectangle(gl, SIZE / 3, SIZE / 3, SIZE / 3, SIZE / 3)
    //   );
    // }

    // positionAttribute.set([centerX + x, centerY + y, centerX - x, centerY - y]);

    // Compute the matrices
    const projectionMatrix = m3.projection(SIZE, SIZE);
    // const projectionMatrix = m3.projection(gl.canvas.width, gl.canvas.height);

    // Set the matrix.
    matrixUniform.set(projectionMatrix);
    textureSizeUniform.set([SIZE, SIZE]);
    if (time === 0) {
      colorUniform.set([0, 0, 0, 255]);
    } else {
      colorUniform.set([0, 130, 0, 255]);
    }
    time++;
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

    // requestAnimationFrame(drawScene);
  }
  setOutputToLenaTexture();
  requestAnimationFrame(drawScene);

  setTimeout(() => {
    setOutputToCanvas();
    requestAnimationFrame(drawScene);
  }, 0);
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
