import { skeletonSize } from "UI";
import { drawCircle, drawLine } from "programs";
import setupRenderTarget from "renders/setupRenderTarget";
import { canvasMatrix } from "programs/canvasMatrix";
import DrawCircle from "programs/DrawCircle";
import State from "State";
import attachListeners from "./attachListeners";
import pick, { ControlType, DrawCall } from "./pick";
import getPathWidth from "utils/getPathWidth";

const THICKNESS_SIZE_CONTROLS = 10;

function getWidthsFootprintFromState(state: State) {
  return `${state.simplificationFactor} ${state.simplePath.length}`;
}

export default class Interactivity {
  private circleThicknessVao: ReturnType<DrawCircle["createVAO"]>;
  // private fbo: FrameBuffer;
  private pointerIsDown: boolean;
  private activeWidthPoint: { index: number; progress: number } | null; // counted in segment progress
  private lastWidthsFootprint: string;
  private widthIndicators: Line[];
  private previewWidthProgress: number | null;
  private nextRAFid: number; // stores id of last requested requestAnimationFrame, if !== 0 we know last frame wasn't performed yet

  constructor(private stateRef: State, private drawCalls: DrawCall[]) {
    this.circleThicknessVao = drawCircle.createVAO(THICKNESS_SIZE_CONTROLS);
    this.pointerIsDown = false;
    this.activeWidthPoint = null;
    this.previewWidthProgress = null;
    this.lastWidthsFootprint = "";
    this.widthIndicators = [];
    this.nextRAFid = 0;

    attachListeners(this.onPointerDown, this.onPointerMove, this.onPointerUp);
  }

  public onPointerDown = (pointer: Point) => {
    this.pointerIsDown = true;
    if (this.stateRef.brushMode) {
      if (this.pointerIsDown) {
        this.stateRef.addControlPoint(pointer);
      }
    } else {
      this.requestHoverUpdate(pointer);
    }
  };

  public onPointerUp = (pointer: Point) => {
    this.pointerIsDown = false;
    this.activeWidthPoint = null;
    if (this.stateRef.brushMode) {
      this.stateRef.addControlPoint(pointer, true);
    }
    this.stateRef.refresh();
  };

  private requestHoverUpdate(pointer: Point) {
    if (this.nextRAFid !== 0) {
      // previously requested one can be skipped, we got a new one to request
      cancelAnimationFrame(this.nextRAFid);
      /* otherwise sometimes flow looks like:
      1. mouse moves
      2. mouse moves again
      3. Call raf twice, so both of then will avoid above if, even if first raf sets this.activeWidthPoint toa  positive value
      */
    }

    this.nextRAFid = requestAnimationFrame(() => {
      this.nextRAFid = 0;
      this.getHover(pointer);
    });
  }

  public onPointerMove = (pointer: Point) => {
    if (this.activeWidthPoint) {
      // we are in edit width for particular point mode
      this.stateRef.updateWidthPoint(
        this.activeWidthPoint.index,
        this.activeWidthPoint.progress,
        pointer
      );
      // optimization to avoid additional request animation frame
      return;
    }

    if (this.stateRef.brushMode) {
      if (this.pointerIsDown) {
        this.stateRef.addControlPoint(pointer);
      }
    } else {
      this.requestHoverUpdate(pointer);
    }
  };

  private getIndicator(segmentProgress: number): Line {
    // pathProgress -> relative distance measured in number of points form the start <0, infinity>?
    // pathOffset -> <0, 1>

    const [pointOnCurve, curveTan] =
      this.stateRef.getPosAndTan(segmentProgress);
    // maybe we should move above to preview/pick. Since it's more there related than to State
    const offset = Math.abs(1 - 0.5) * 2; // 1 can be replaced with real offset
    const width = getPathWidth(segmentProgress, this.stateRef);
    const p1 = {
      x: pointOnCurve.x - curveTan.y * width * offset,
      y: pointOnCurve.y + curveTan.x * width * offset,
    };

    const p2 = {
      x: pointOnCurve.x + curveTan.y * width * offset,
      y: pointOnCurve.y - curveTan.x * width * offset,
    };

    return [p1, p2];
  }

  private getHover(pointer: Point) {
    const drawCalls = [
      ...this.drawCalls,
      ...this.widthIndicators.map<DrawCall>(
        (indicator, index) => (matrix) =>
          this.drawPickIndicator(matrix, indicator, index)
      ),
    ];
    const [red, green, blue] = Array.from(
      pick(this.stateRef.simplePath, pointer, drawCalls)
    );

    const type = Math.round(blue);

    switch (type) {
      case ControlType.nil: {
        // previewWidthProgress is always null here
        // if (this.activeWidthPoint !== null) {
        //   // hide active indicator ONLY when we do not edit width right now
        //   this.activeWidthPoint = null;
        // }

        if (this.previewWidthProgress !== null) {
          this.previewWidthProgress = null;
          this.stateRef.refresh();
        }

        if (this.pointerIsDown && this.stateRef.brushMode) {
          this.stateRef.addControlPoint(pointer); // it should be never the case!!! You cannot hover and at same time add control point!
        }
        break;
      }
      case ControlType.path: {
        if (this.stateRef.brushMode) break;
        // at this point this.activeWidthPoint should be null
        if (this.pointerIsDown) {
          // not sure if we nee to create activeWidthPoint here, or will be create anyway
          // this one if condition should be moved to interactivity probably

          // following code is just to see update right away
          // otherwise user would need firstly to move the pointer to change the width
          const index = this.stateRef.addWidthPoint(green, pointer);
          this.activeWidthPoint = {
            index,
            progress: green,
          };
        }

        this.previewWidthProgress = green;
        this.stateRef.refresh();
        break;
      }
      case ControlType.width: {
        const index = Math.round(red);
        const widthPoint = this.stateRef.widthPoints[index];
        const segmentProgress =
          widthPoint.progress * (this.stateRef.simplePath.length / 3);

        if (this.pointerIsDown) {
          this.activeWidthPoint = {
            index,
            progress: segmentProgress,
          };

          this.stateRef.updateWidthPoint(index, segmentProgress, pointer);
        }
        this.previewWidthProgress = segmentProgress;

        this.stateRef.refresh();
        break;
      }
      default: {
        throw Error(`There is no such a type as ${type}.`);
      }
    }
  }

  private drawPickIndicator(matrix: Mat3, [p1, p2]: Line, index: number) {
    const gl = window.gl;
    const color: vec4 = [index, 0, ControlType.width, 1];

    drawLine.setup(matrix, p1, p2, color, color, 40, 20);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.bindVertexArray(null);
  }

  private drawIndicator([p1, p2]: Line, isActive: boolean) {
    const gl = window.gl;
    const color1: vec4 = isActive ? [1, 1, 1, 1] : [1, 0, 0, 1];
    const color2: vec4 = isActive ? [1, 1, 1, 1] : [0, 1, 0, 1];

    drawLine.setup(canvasMatrix, p1, p2, color1, color2);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.bindVertexArray(null);

    const positions = [p1.x, p1.y, p2.x, p2.y];
    const colors = [...color1 /* */, ...color2];
    this.circleThicknessVao.setPos(new Float32Array(positions));
    this.circleThicknessVao.setColor(new Float32Array(colors));
    drawCircle.setup(this.circleThicknessVao, canvasMatrix);
    gl.drawElementsInstanced(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0, 2);
    gl.bindVertexArray(null);
  }

  public render(state: State) {
    const { stateRef } = this;

    if (stateRef.brushMode) return;

    setupRenderTarget(null);

    const currWidthFootprint = getWidthsFootprintFromState(stateRef);

    if (
      stateRef.simplePath.length >= 2 &&
      (this.activeWidthPoint !== null ||
        this.lastWidthsFootprint !== currWidthFootprint)
    ) {
      // widths needs to be calculated again
      this.lastWidthsFootprint = currWidthFootprint;
      this.widthIndicators = state.widthPoints.map((widthPoint) =>
        this.getIndicator(widthPoint.progress * (state.simplePath.length / 3))
      );
    }

    this.widthIndicators.forEach((indicator) =>
      this.drawIndicator(indicator, false)
    );

    if (this.previewWidthProgress !== null) {
      const activeIndicator = this.getIndicator(this.previewWidthProgress);
      this.drawIndicator(activeIndicator, true);
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
