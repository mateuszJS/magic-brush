import MiniatureVideo from "models/Video/MiniatureVideo";
import { updateToolbar } from "UI/createToolbar";
import { MS_PER_PIXEL } from "consts";
import { updateTimelineScroll, updateTimelineWidth } from "UI";
import getBezierPos from "utils/getBezierPos";
import getBezierTan from "utils/getBezierTan";
import distancePointToLine from "utils/distancePointToLine";
import getDistance from "utils/getDistance";
import fitCurve from "./utils/fitCurve";
import getCurveLength from "utils/getCurveLength";

export interface WidthPoint {
  progress: number;
  offset: number;
}

export const DEFAULT_OFFSET = 80;
const TEX_COORD_PRECISION = 10;
const SIMPLIFICATION_FACTOR = 400;

export interface Segment {
  controlPoints: [Point, Point, Point, Point]; // knot, control point, control point, knot
  // all of the them be called control points, knot is a special type because curve go though that point
  lengths: number[]; // progressive lengths
}

export default class State {
  private inputPoints: Point[]; // this is exactly path from user input
  public brushMode: boolean;
  public segments: Segment[];
  public currTime: number;
  public needsRefresh: boolean; // indicates if we should make an update or not
  public video: MiniatureVideo;
  public widthPoints: WidthPoint[];
  private draftPoint: Point | null;
  private withinDirection: null | ((p: Point) => boolean);
  public segmentsUpdate: number; // helper flag, so we don't need to deeply compare segments to know if rerender is needed

  constructor(videoUrl: string, onVideoLoaded: (state: State) => void) {
    this.currTime = 0;
    this.needsRefresh = true;
    this.brushMode = false;
    this.inputPoints = [];
    this.segments = [];
    this.widthPoints = [
      { progress: 0, offset: DEFAULT_OFFSET },
      { progress: 1, offset: DEFAULT_OFFSET },
    ];
    this.draftPoint = null; // maybe it can be connected with preview point?
    this.withinDirection = null;
    this.segmentsUpdate = 0;

    const onLoadVideo = (video: MiniatureVideo) => {
      onVideoLoaded(this);
      this.refresh();
      const updateUIresize = () => {
        const width = video.duration / MS_PER_PIXEL;
        updateTimelineWidth(width);
        updateTimelineScroll(this);
      };
      window.addEventListener("resize", updateUIresize);
      updateUIresize();
    };

    this.video = new MiniatureVideo(
      videoUrl,
      onLoadVideo,
      () => this.currTime,
      this.pauseVideo
    );
  }

  private getWidthDistance(segmentProgress: number, pointer: Point) {
    const [pointOnPath] = this.getPosAndTan(segmentProgress);

    return Math.hypot(pointOnPath.x - pointer.x, pointOnPath.y - pointer.y);
  }

  public addWidthPoint(segmentProgress: number, pointer: Point): number {
    // returns index of newly created widthPoint
    const distance = this.getWidthDistance(segmentProgress, pointer);
    const pathProgress = segmentProgress / this.segments.length;

    const newWidthPoint = {
      progress: pathProgress,
      offset: distance,
    };

    this.widthPoints.push(newWidthPoint);
    this.widthPoints.sort((a, b) => a.progress - b.progress); // it can be optimized with slices

    this.refresh();

    return this.widthPoints.indexOf(newWidthPoint);
  }

  public removeWidthPoint(index: number) {
    this.widthPoints = this.widthPoints.filter(
      (_, pointIndex) => pointIndex !== index
    );
    this.refresh();
  }

  public updateWidthPoint(
    index: number,
    segmentProgress: number,
    pointer: Point
  ) {
    const distance = this.getWidthDistance(segmentProgress, pointer);
    this.widthPoints[index].offset = distance;
    this.refresh();
  }

  public getPosAndTan(progress: number) {
    // progress measured in segments

    const segmentIndex = Math.floor(progress);
    const [safeSegmentIndex, t] =
      segmentIndex === this.segments.length // progress at the very end of the path is equal this.segments.length
        ? [this.segments.length - 1, 1]
        : [segmentIndex, progress % 1];
    const { controlPoints } = this.segments[safeSegmentIndex];
    const pointOnCurve = getBezierPos(...controlPoints, t);
    const curveTan = getBezierTan(...controlPoints, t);

    return [pointOnCurve, curveTan];
  }

  public addControlPoint(pointer: Point, last = false) {
    const { inputPoints, draftPoint, withinDirection } = this;

    if (inputPoints.length === 0 || last) {
      inputPoints.push(pointer);
      this.draftPoint = null;
      if (last) {
        this.updateControlPoints();
      }
      return; // no rerender, no draftPoint update
    }

    const lastInput = inputPoints[inputPoints.length - 1];
    if (
      getDistance(lastInput, pointer) > 10 &&
      (withinDirection === null || !withinDirection(pointer))
    ) {
      if (withinDirection && draftPoint) {
        // draftPoint should be ALWAYS provided here, so it's just added because of TS
        inputPoints.push(draftPoint);
      }
      this.withinDirection = (p: Point) =>
        distancePointToLine(p, lastInput, pointer) < 5;
    }

    this.draftPoint = pointer;
    this.updateControlPoints();
  }

  private updateControlPoints() {
    const pointsAsArray = this.inputPoints.map((p) => [p.x, p.y]);

    if (this.draftPoint) {
      pointsAsArray.push([this.draftPoint.x, this.draftPoint.y]);
    }

    const fitted = fitCurve(
      pointsAsArray,
      this.draftPoint ? 10 : SIMPLIFICATION_FACTOR
    );
    if (fitted.length === 0) return;

    this.segments = fitted.map<Segment>((bezierCurve) => {
      const controlPoints = bezierCurve.map(([x, y]) => ({
        x,
        y,
      })) as Segment["controlPoints"];
      const lengths = getCurveLength(...controlPoints, TEX_COORD_PRECISION);

      return {
        controlPoints,
        lengths,
      };
    });

    this.refresh();
  }

  public playVideo = () => {
    this.video.play(this.currTime);
    updateToolbar(this);
  };

  public pauseVideo = () => {
    this.video.pause();
    updateToolbar(this);
    this.refresh();
  };

  public refresh = () => {
    this.needsRefresh = true;
  };

  public toggleBrushMode = () => {
    if (this.brushMode) {
      this.brushMode = false;
      return;
    }

    this.pauseVideo();
    this.brushMode = true;
  };
}
