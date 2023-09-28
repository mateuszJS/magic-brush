import { skeletonSize } from "UI";
import { drawCircle, drawLine } from "programs";
import setupRenderTarget from "renders/setupRenderTarget";
import DrawCircle from "programs/DrawCircle";
import State from "State";
import attachListeners from "./attachListeners";
import pick, { ControlType, DrawCall } from "./pick";
import getPathWidth from "utils/getPathWidth";
import renderIndicator from "./renderIndicator";
import {
  hideRemoveWidthPointBtn,
  showRemoveWidthPointBtn,
} from "./removeWidthPointBtn";

const THICKNESS_SIZE_CONTROLS = 10;

const NO_SELECTION = [0, 0, 0, 0];

export default class Interactivity {
  private circleThicknessVao: ReturnType<DrawCircle["createVAO"]>;
  private activeCircleThicknessVao: ReturnType<DrawCircle["createVAO"]>;
  private pointerIsDown: boolean;
  private nextRAFid: number; // stores id of last requested requestAnimationFrame, if !== 0 we know last frame wasn't performed yet
  private pathHoverProgress: number | null;
  private selectedWidthPointIndex: number | null;

  constructor(private stateRef: State, private drawCalls: DrawCall[]) {
    this.circleThicknessVao = drawCircle.createVAO(THICKNESS_SIZE_CONTROLS);
    this.activeCircleThicknessVao = drawCircle.createVAO(30);
    this.pointerIsDown = false;
    this.nextRAFid = 0;
    this.pathHoverProgress = null;
    this.selectedWidthPointIndex = null;

    attachListeners(this.onPointerDown, this.onPointerMove, this.onPointerUp);
  }

  private onPointerDown = (pointer: Point) => {
    // Think how to implement it without stateRef AND also how to handle multiple splines!!!!

    // We should get spline ids, and pass it to addControlPoint. addControlPoint cannot be method of Segment or Spline class, because needs to update flag in State segmentsUpdate++
    this.pointerIsDown = true;
    if (this.stateRef.brushMode) {
      if (this.pointerIsDown) {
        this.stateRef.addControlPoint(pointer);
      }
    } else {
      this.requestHoverUpdate(pointer);
    }
  };

  private onPointerUp = (pointer: Point) => {
    this.pointerIsDown = false;

    if (this.stateRef.brushMode) {
      this.stateRef.addControlPoint(pointer, true);
    }
    this.stateRef.refresh();
  };

  private onPointerMove = (pointer: Point) => {
    if (this.selectedWidthPointIndex !== null && this.pointerIsDown) {
      // we are in edit width for particular point mode
      this.stateRef.updateWidthPoint(
        this.selectedWidthPointIndex,
        this.pathHoverProgress!, // it's never null when selectedWidthPointIndex is a number
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
      ...this.stateRef.widthPoints.map<DrawCall>(
        (point, index) => (matrix) =>
          this.drawPickIndicator(
            matrix,
            point.progress * this.stateRef.segments.length,
            index
          )
      ),
    ];

    const [red, green, blue] =
      this.stateRef.segments.length === 0
        ? NO_SELECTION
        : Array.from(pick(pointer, drawCalls));

    const type = Math.round(blue);

    this.selectedWidthPointIndex = null;

    switch (type) {
      case ControlType.nil: {
        if (this.pathHoverProgress !== null) {
          // if pointerIsDown and widthPointIndicator exists, then we never reach this place
          this.pathHoverProgress = null;
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
        this.pathHoverProgress = green;

        if (this.pointerIsDown) {
          const index = this.stateRef.addWidthPoint(green, pointer);
          this.selectedWidthPointIndex = index;
        }

        this.stateRef.refresh();
        break;
      }
      case ControlType.width: {
        const index = Math.round(red);

        if (index === this.selectedWidthPointIndex) break; // avoid unnecessary rerenders

        this.selectedWidthPointIndex = index;
        const widthPoint = this.stateRef.widthPoints[index];
        this.pathHoverProgress =
          widthPoint.progress * this.stateRef.segments.length; // maybe it better to encode progress in red channel

        this.stateRef.refresh();
        break;
      }
      default: {
        throw Error(`There is no such a type as ${type}.`);
      }
    }
  }

  private drawPickIndicator(matrix: Mat3, progress: number, index: number) {
    const [p1, p2] = this.getIndicator(progress);
    const gl = window.gl;
    const color: vec4 = [index, 0, ControlType.width, 1];

    drawLine.setup(matrix, p1, p2, color, color, 60, 60);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.bindVertexArray(null);
  }

  private drawIndicator(progress: number, isActive: boolean) {
    renderIndicator(
      this.circleThicknessVao,
      this.activeCircleThicknessVao,
      this.getIndicator(progress),
      isActive
    );
  }

  private onWidthPointRemove = (e: MouseEvent) => {
    e.stopPropagation(); // otherwise click on canvas will be detected
    this.stateRef.removeWidthPoint(this.selectedWidthPointIndex!);
    this.selectedWidthPointIndex = null;
  };

  public render(state: State) {
    const { stateRef } = this;

    if (stateRef.brushMode || stateRef.segments.length === 0) return;

    setupRenderTarget(null);

    if (this.pathHoverProgress !== null) {
      this.drawIndicator(this.pathHoverProgress, true);
    }

    let isBtnVisible = false;

    state.widthPoints.forEach((point, index) => {
      if (this.selectedWidthPointIndex === index) {
        const isEdgePoint =
          index === 0 || index === state.widthPoints.length - 1;
        if (!isEdgePoint) {
          const line = this.getIndicator(this.pathHoverProgress!); // when selectedWidthPointIndex is a number, so do pathHoverProgress
          // you cannot remove width point at the start and at the end of the spline
          const btnPosition = line[0].y < line[1].y ? line[0] : line[1];
          showRemoveWidthPointBtn(btnPosition, this.onWidthPointRemove);
          isBtnVisible = true;
        }
      } else {
        this.drawIndicator(point.progress * state.segments.length, false);
      }
    });

    if (isBtnVisible === false) {
      hideRemoveWidthPointBtn();
    }
  }
}
