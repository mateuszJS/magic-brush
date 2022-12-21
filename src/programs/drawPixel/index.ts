import vertexShaderSource from "../index.vert";
import fragmentShaderSource from "./index.frag";
import createProgram from "utils/WebGL/createProgram";
import uVec2 from "models/UVec2";
import uMat3 from "models/UMat3";
import Attribute from "models/Attribute";
import Texture from "models/Texture";
import UVec2 from "models/UVec2";
import { SIZE } from "index";
import * as m3 from "utils/m3";
import getRectCoords from "utils/getRectCoords";

/*
  // Create and bind the framebuffer
  // frame buffers allow you to render to texture or renderbuffers
  // frame buffer is a collection fo attachments
  // by default WebGL has set frame buffer rendering to canvas
  this.frameBuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
  // https://webglfundamentals.org/webgl/lessons/webgl-framebuffers.html

  // to add an attachment you can use framebufferTexture2D or framebufferRenderbuffer
  // depends if destination is a texture or render buffer
  const attachmentPoint = gl.COLOR_ATTACHMENT0;
  // we assume that texture is always pointing to primary created texture, you cannot change this pointer
  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    attachmentPoint,
    gl.TEXTURE_2D,
    this.texture,
    this.level
  );
}

gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);

// render cube with our 3x2 texture
// gl.bindTexture(gl.TEXTURE_2D, this.texture);

// Tell WebGL how to convert from clip space to pixels
gl.viewport(0, 0, this.width, this.height);

// Clear the attachment(s).
gl.clearColor(0, 0, 0, 1); // clear to black
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
*/

// function renderToRenderBuffer(gl: WebGLRenderingContext) {
//   const renderBuffer = gl.createRenderbuffer();
//   gl.bindRenderbuffer(gl.RENDERBUFFER, renderBuffer);

//   const frameBuffer = gl.createFramebuffer();
//   gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);

//   gl.framebufferRenderbuffer(
//     gl.FRAMEBUFFER, // in webgl2 more values are available
//     gl.COLOR_ATTACHMENT0,
//     gl.RENDERBUFFER,
//     renderBuffer
//   );

//   gl.viewport(0, 0, SIZE, SIZE);

//   // Clear the attachment(s).
//   gl.clearColor(0, 0, 0, 1); // clear to black
//   gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
// }

export default function setup(gl: WebGLRenderingContext) {
  const program = createProgram(gl, vertexShaderSource, fragmentShaderSource);

  const mouseCoordUniform = new uVec2(gl, program, "u_mouseCoord");
  const matrixUniform = new uMat3(gl, program, "u_matrix");
  const positionAttribute = new Attribute(gl, program, "a_position");
  const texCoordAttribute = new Attribute(gl, program, "a_texCoord");
  const textureSizeUniform = new UVec2(gl, program, "u_textureSize");
  const output = new Texture(gl, [0, 0, 0, 255], SIZE, SIZE);
  const projectionMatrix = m3.projection(SIZE, SIZE);

  return (
    inputTexture: WebGLTexture,
    normMouseX: number,
    normMouseY: number
  ) => {
    output.setAsOutput();
    // renderToRenderBuffer(gl);

    gl.bindTexture(gl.TEXTURE_2D, inputTexture);

    gl.useProgram(program);
    texCoordAttribute.set([
      0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0,
    ]);
    positionAttribute.set(getRectCoords(0, 0, SIZE, SIZE));
    matrixUniform.set(projectionMatrix);
    textureSizeUniform.set([SIZE, SIZE]);
    mouseCoordUniform.set([normMouseX, normMouseY]);
    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    var count = 6;
    gl.drawArrays(primitiveType, offset, count);

    // return output;
  };
}
