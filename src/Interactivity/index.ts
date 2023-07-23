import { skeletonSize } from "UI";
import { drawCircle, drawLine, drawTexture, drawTexture3D } from "programs";
import setupRenderTarget from "renders/setupRenderTarget";
import m3 from "utils/m3";
import { canvasMatrix } from "programs/canvasMatrix";
import { MINI_SIZE, MS_PER_MINI, MS_PER_PIXEL } from "consts";
import Texture from "models/Texture";
import DrawCircle from "programs/DrawCircle";
import FrameBuffer from "models/FrameBuffer";
import { getVec3IdFromLastRender } from "utils/id";
import State from "State";
import attachListeners from "./attachListeners";
import getBezierTan from "utils/getBezierTan";
import getBezierPos from "utils/getBezierPos";
import pick, { ControlType, DrawCall } from "./pick";

const THICKNESS_SIZE_CONTROLS = 10;

interface Control {
  id: number;
  idVec4: vec4;
  x: number;
  y: number;
  type: ControlType;
}

export default class Interactivity {
  private circleThicknessVao: ReturnType<DrawCircle["createVAO"]>;
  // private fbo: FrameBuffer;
  private pointerIsDown: boolean;
  private pointerOffset: Point;
  private newPointerPos: Point | null;

  constructor(private stateRef: State, private drawCalls: DrawCall[]) {
    this.circleThicknessVao = drawCircle.createVAO(THICKNESS_SIZE_CONTROLS);
    // this.fbo = new FrameBuffer();
    // this.fbo.resize(BUFFER_SIZE, BUFFER_SIZE);
    this.pointerIsDown = false;
    this.pointerOffset = { x: 0, y: 0 };
    this.newPointerPos = null; // set when mouse is moving, set to null once we get the update

    attachListeners(this.onPointerDown, this.onPointerMove, this.onPointerUp);
  }

  public onPointerDown = (x: number, y: number) => {
    this.pointerIsDown = true;

    // const newSelectionId = this.pick(x, y);
    // const newSelectedHandler = this.snow?.curve.find(
    //   (point) => point.id === newSelectionId
    // );

    // if (newSelectedHandler) {
    //   this.selectedHandler = newSelectedHandler;
    //   this.pointerOffset = {
    //     x: newSelectedHandler.x - x,
    //     y: newSelectedHandler.y - y,
    //   }
    //   this.refresh();
    // }
  };

  public onPointerUp = () => {
    // this.selectedHandler = null;
    this.stateRef.refresh();
    this.pointerIsDown = false;
  };

  public onPointerMove = (x: number, y: number) => {
    if (this.pointerIsDown) {
      this.stateRef.addControlPoint(x, y);
    } else {
      this.newPointerPos = { x, y };
      this.stateRef.refresh();
    }
  };

  private getHover(x: number, y: number) {
    const [red, green, blue] = Array.from(
      pick(this.stateRef.simplePath, x, y, this.drawCalls)
    );
    const type = Math.round(blue);

    switch (type) {
      case ControlType.nil: {
        this.stateRef.lostHover();
        break;
      }
      case ControlType.path: {
        if (this.pointerIsDown) {
          this.stateRef.handlePathPointerDown(green, red, x, y);
        } else {
          this.stateRef.handlePathHover(green, red);
        }
        break;
      }
      default: {
        throw Error("Not handled output!");
      }
    }
  }

  // public updateSelection = (state: State, x: number, y: number) => {
  //   const gl = window.gl;
  //   const snow = state.snow;
  //   if (!snow) return 0;

  //   const translatedMatrix = m3.translate(
  //     m3.projectionFlipY(BUFFER_SIZE, BUFFER_SIZE),
  //     -x,
  //     -y
  //   );

  //   const positions = snow.curve.flatMap((point) => [point.x, point.y]);
  //   const colors = snow.curve.flatMap((point) => point.idVec4);
  //   setupRenderTarget(this.fbo, [0, 0, 0, 1]);
  //   this.vao.setPos(new Float32Array(positions));
  //   this.vao.setColor(new Float32Array(colors));
  //   drawCircle.setup(this.vao, translatedMatrix);
  //   gl.drawElementsInstanced(
  //     gl.TRIANGLES,
  //     6,
  //     gl.UNSIGNED_SHORT,
  //     0,
  //     snow.curve.length
  //   );
  //   gl.bindVertexArray(null);
  //   return getVec3IdFromLastRender();
  // };

  public render(state: State) {
    const { newPointerPos, stateRef } = this;
    if (newPointerPos) {
      this.getHover(newPointerPos.x, newPointerPos.y);
      this.newPointerPos = null;
    }

    const gl = window.gl;
    setupRenderTarget(null);
    if (stateRef.thickLine) {
      const [p1, p2] = stateRef.thickLine;
      drawLine.setup(canvasMatrix, p1, p2, [1, 1, 1, 1]);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      gl.bindVertexArray(null);

      const positions = [p1.x, p1.y, p2.x, p2.y];
      const colors = [1, 1, 1, 1 /* */, 1, 1, 1, 1];
      this.circleThicknessVao.setPos(new Float32Array(positions));
      this.circleThicknessVao.setColor(new Float32Array(colors));
      drawCircle.setup(this.circleThicknessVao, canvasMatrix);
      gl.drawElementsInstanced(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0, 2);
      gl.bindVertexArray(null);
    }
    //   state.controls.forEach((control) => {
    //     switch (control.type) {
    //       case ControlType.thickness: {
    //         this.drawThickness(state);
    //         return;
    //       }

    //       default: {
    //         this.vao.setPos(new Float32Array([control.x, control.y]));
    //         this.vao.setColor(new Float32Array([1, 1, 1, 1]));
    //         drawCircle.setup(this.vao, canvasMatrix);
    //         gl.drawElementsInstanced(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0, 1);
    //         gl.bindVertexArray(null);
    //       }
    //     }
    //   });
  }
}
