import shaderVertexSource from "./index.vert";
import shaderFragmentSource from "./index.frag";
import { createAttribute } from "../utils/createAttribute";
import { compileShader } from "programs/utils/compileShader";
import { createProgram } from "programs/utils/createProgram";
import { getUniform } from "programs/utils/getUniform";

const defaultColor = [1, 1, 1, 1];

export interface InputData {
  color?: vec4;
}

export default class DrawPrimitive {
  protected program: WebGLProgram;
  private setPositionAttr: ReturnType<typeof createAttribute>;
  private matrixUniform: WebGLUniformLocation;
  private colorUniform?: WebGLUniformLocation;

  constructor(pickingFragShader?: string) {
    const gl = window.gl;
    const vertexShader: WebGLShader = compileShader(
      gl.VERTEX_SHADER,
      shaderVertexSource
    );
    const fragmentShader: WebGLShader = compileShader(
      gl.FRAGMENT_SHADER,
      pickingFragShader || shaderFragmentSource
    );

    this.program = createProgram(gl, vertexShader, fragmentShader);

    // speed up setting attribute with bindVertexArrayOES https://webglfundamentals.org/webgl/lessons/webgl-attributes.html
    this.setPositionAttr = createAttribute(gl, this.program, "a_position");
    this.matrixUniform = getUniform(this.program, "u_matrix");

    if (!pickingFragShader) {
      this.colorUniform = getUniform(this.program, "u_color");
    }
  }

  setupRect(x: number, y: number, width: number, height: number) {
    this.setPositionAttr(
      new Float32Array([
        x,
        y,
        x,
        y + height,
        x + width,
        y,
        x + width,
        y + height,
        x,
        y + height,
        x + width,
        y,
      ])
    );

    // returns number of vertices, useful to pass to render function
    return 6;
  }

  setup4CornerShape(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number,
    x4: number,
    y4: number
  ) {
    this.setPositionAttr(
      new Float32Array([x1, y1, x2, y2, x3, y3, x1, y1, x3, y3, x4, y4])
    );

    // returns number of vertices, useful to pass to render function
    return 6;
  }

  setupPolygonWithCenter(points: Point[], offset: Point) {
    const centerPoint: Point = points.reduce(
      (resultPoint, point) => ({
        x: resultPoint.x + point.x / points.length,
        y: resultPoint.y + point.y / points.length,
      }),
      { x: 0, y: 0 }
    );

    const vertices = [];
    for (let i = 0; i < points.length; i++) {
      const currentPoint = points[i];
      vertices.push(currentPoint.x + offset.x);
      vertices.push(currentPoint.y + offset.y);

      const nextPoint = points[(i + 1) % points.length];
      vertices.push(nextPoint.x + offset.x);
      vertices.push(nextPoint.y + offset.y);

      vertices.push(centerPoint.x + offset.x);
      vertices.push(centerPoint.y + offset.y);
    }

    this.setPositionAttr(new Float32Array(vertices));

    // returns number of vertices, useful to pass to render function
    return vertices.length / 2;
  }

  // setupOctagon(x: number, y: number, radius: number) {
  //   const numberOfCorners = 8
  //   const angleOffset = 1 / numberOfCorners * (2 * Math.PI)
  //   // always call it after setup()
  //   const vertices = []
  //   for (let i = 0; i < 8; i++) {
  //     vertices.push(x)
  //     vertices.push(y)
  //     vertices.push(x + Math.sin(angleOffset * i) * radius)
  //     vertices.push(y - Math.cos(angleOffset * i) * radius)
  //     vertices.push(x + Math.sin(angleOffset * (i + 1)) * radius)
  //     vertices.push(y - Math.cos(angleOffset * (i + 1)) * radius)
  //   }

  //   this.setPositionAttr(new Float32Array(vertices))

  //   // returns number of vertices, useful to pass to render function
  //   return 24
  // }

  setup(inputData: InputData, matrix: Matrix3) {
    const gl = window.gl;
    gl.useProgram(this.program);
    gl.uniformMatrix3fv(this.matrixUniform, false, matrix);
    if (this.colorUniform) {
      gl.uniform4fv(this.colorUniform, inputData.color || defaultColor);
    }
  }
}
