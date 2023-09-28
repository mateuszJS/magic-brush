import { drawBezier, drawBezierPick, drawLine } from "programs";
import setupRenderTarget from "renders/setupRenderTarget";
import { canvasMatrix } from "programs/canvasMatrix";
import DrawBezier from "programs/DrawBezier";
import brushPng from "assets/wave.png";
import Texture from "models/Texture";
import State, { DEFAULT_OFFSET } from "State";
import getPathWidth from "utils/getPathWidth";
import getTrianglesNumber from "./getTrianglesNumber";

// const ITER = 22;

// if (ITER % 2 === 1) {
//   throw Error("ITER number must be even");
// }
// if ((ITER / 2) % 2 === 0) {
//   throw Error("ITER number divided by 2 must be odd");
// }

// function getWidthFactor(state: State, i: number) {
//   const segmentProgress = i / 3;

//   const startWidth = getPathWidth(segmentProgress, state);
//   const endWidth = getPathWidth(segmentProgress + 1, state);

//   const totalSegmentProgress = state.simplePath.length / 3; // 3 because one segment contains 4 in total, by dividing by 3 we got number of segment(two nodes and tow control points)
//   const progress = segmentProgress / totalSegmentProgress;
//   const allWidthPointsWithinSegment = state.widthPoints.find(
//     (point) => point.progress > i / 3 && point.progress < i / 3 + 1
//   );

//   // it can be done better

//   if (allWidthPointsWithinSegment) {
//     // console.log(i / 3, allWidthPointsWithinSegment, state.widthPoints);
//     return 50;
//   }

//   // const x = allWidthPointsWithinSegment.reduce((acc, widthPoint, index) => {
//   //   if (index === 0) return acc;

//   //   const nextPoint = allWidthPointsWithinSegment[index + 1];
//   //   const distance =
//   //     widthPoint.offset -
//   //     nextPoint.offset -
//   //     widthPoint.progress * totalDistance -
//   //     nextPoint.progress * totalDistance;
//   //   return Math.max();
//   // }, Infinity);

//   const widthDiff = Math.abs(startWidth - endWidth); // if just those two widths are similar, it won't work!!!!

//   return widthDiff / 7;
// }

export default class Effects {
  private VAOs: {
    [key: number]: ReturnType<DrawBezier["createVAO"]>;
  };
  private tex: Texture;
  private brushAspectRatio: number;

  constructor() {
    this.VAOs = [];
    this.tex = new Texture();
    this.brushAspectRatio = 1;

    const img = new Image();
    img.src = brushPng;
    img.onload = () => {
      this.tex.fill(img);
      this.brushAspectRatio = img.width / img.height;
    };
  }

  private getVao(iter: number) {
    if (!(iter in this.VAOs)) {
      this.VAOs[iter] = drawBezier.createVAO(iter);
    }

    return this.VAOs[iter];
  }

  private draw(state: State, matrix: Mat3, isPick: boolean) {
    const program = isPick ? drawBezierPick : drawBezier;
    const gl = window.gl;
    const thickness = 200 / this.brushAspectRatio;
    const splineOffset = state.currTime / state.video.duration;

    let prevTexCoordYoffset = 0;

    state.segments.forEach((segment, index) => {
      const { controlPoints, lengths } = segment;

      const precision = lengths.length - 1;

      const getTexCoord = (t: number) => {
        const topIndex = Math.ceil(t * precision);
        const bottomIndex = Math.floor(t * precision);
        const diff = t * precision - bottomIndex; // <0, 1>
        const distanceAvg =
          (1 - diff) * lengths[bottomIndex] + diff * lengths[topIndex];
        const offset = index === 0 ? splineOffset : 0; // just an additional effect to animate the brush
        return prevTexCoordYoffset + distanceAvg / thickness + offset;
      };

      const getThickness = (t: number) => {
        const globalT = index + t; // state.widthPoints are divided per segments
        if (state.widthPoints.length === 0) return DEFAULT_OFFSET;

        return getPathWidth(globalT, state);
      };

      const widthPoints = [
        { offset: getThickness(0), progress: 0 },
        ...state.widthPoints.filter(
          (p) => p.progress < index + 1 && p.progress > index
        ),
        { offset: getThickness(1), progress: 1 },
      ];

      const trianglesNumber = getTrianglesNumber(segment, widthPoints);
      const vao = this.getVao(trianglesNumber);
      vao.updateTexCoordY(getTexCoord);

      vao.updateThickness(getThickness);

      program.setup(
        vao,
        matrix,
        ...controlPoints,
        this.tex.bind(0),
        isPick ? index : 0
      );
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, trianglesNumber);
      prevTexCoordYoffset = getTexCoord(1);
    });
    gl.bindVertexArray(null);
  }

  public renderPick(state: State, matrix: Mat3) {
    if (state.segments.length > 0) {
      this.draw(state, matrix, true);
    }
  }

  public render(state: State) {
    if (state.segments.length > 0) {
      setupRenderTarget(null);
      this.draw(state, canvasMatrix, false);
    }
  }
}
