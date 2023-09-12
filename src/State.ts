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

export interface Segment {
  controlPoints: [Point, Point, Point, Point]; // knot, control point, control point, knot
  // all of the them be called control points, knot is a special type because curve go though that point
  lengths: number[]; // progressive lengths
}

export default class State {
  private inputPoints: Point[]; // this is exactly path from user input
  private inProgressPoints: Point[];
  private previewNextPoint: Point | null;
  public brushMode: boolean;
  public segments: Segment[];
  public currTime: number;
  public needsRefresh: boolean; // indicates if we should make an update or not
  public video: MiniatureVideo;
  public widthPoints: WidthPoint[];
  public simplificationFactor: number;

  constructor(videoUrl: string, onVideoLoaded: (state: State) => void) {
    this.currTime = 0;
    this.needsRefresh = true;
    this.brushMode = false;
    this.inputPoints = [];
    this.inProgressPoints = [];
    this.segments = [];
    this.simplificationFactor = 0.1;
    this.widthPoints = [
      { progress: 0, offset: DEFAULT_OFFSET },
      { progress: 1, offset: DEFAULT_OFFSET },
    ];
    this.previewNextPoint = null;

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
    const { inputPoints, inProgressPoints } = this;
    /*
    inProgressPoints array si used to store all the points which are in same direction.
    Direction is calc between last inputPoints point and first inProgressPoint.
    Once pointer is not on that line(not within direction), we add last correct point (last time of inProgressPoint)
    to inputPoints, and we add pointer to inProgressPoint since now we draw in a different direction
    */

    // TODO: we should reset inProgressPoints

    if (inputPoints.length === 0) {
      inputPoints.push(pointer);
      this.updateControlPoints();
      return;
    }

    const firstProgressPoint = inProgressPoints[0];
    const lastDetailPoint = inputPoints[inputPoints.length - 1];
    // TODO: maybe we can change it from an array to just two Point, since we need only last and first
    const distanceFromLastDetailPoint = getDistance(lastDetailPoint, pointer);

    if (last) {
      this.previewNextPoint = null;
      this.updateControlPoints();
    } else if (distanceFromLastDetailPoint > 0) {
      this.previewNextPoint = pointer;
      this.updateControlPoints();
    }

    if (last && distanceFromLastDetailPoint > 5) {
      // just to do not overlap
      // this is last added point, because mouse is up now

      const deviationFromTheDirection = firstProgressPoint
        ? distancePointToLine(pointer, lastDetailPoint, firstProgressPoint)
        : 0;

      if (deviationFromTheDirection < 5) {
        // 99.99% times goes this way
        inputPoints[inputPoints.length - 1] = pointer;
        // the result should be same, and we won't get tow point almost overlapping(what created weird ending in the brush)
      } else {
        inputPoints.push(pointer);
      }
      this.updateControlPoints();
      return;
    }

    if (distanceFromLastDetailPoint < 10) return;

    if (inProgressPoints.length === 0) {
      inProgressPoints.push(pointer);
      this.updateControlPoints();
      return;
    }

    const distanceFromFirstProgressPoint = getDistance(
      firstProgressPoint,
      pointer
    );

    if (distanceFromFirstProgressPoint < 5) {
      // TODO: really? Are you sure? This about it again
      // direction can be very random while distance < 5(position maybe didn't change even)
      return;
    }

    const deviationFromTheDirection = distancePointToLine(
      pointer,
      lastDetailPoint,
      firstProgressPoint
    );

    // we should write the last oen that was OKAY, and then continue inProgress with new point

    if (deviationFromTheDirection > 5) {
      // newest point has a different direction
      const lastProgressPoint = inProgressPoints[inProgressPoints.length - 1]; // last one that was correct, since current "pointer" is not in same direction
      inputPoints.push(lastProgressPoint);
      // at this time we for sure have the start and the end of the path, I bet that's why we use empty array
      this.inProgressPoints = []; // pointer should be 50px far from
      // this.inProgressPoints = [{ x, y }];
    } else {
      // new point is at the same direction
      inProgressPoints.push(pointer);
    }

    this.updateControlPoints();
  }

  private updateControlPoints() {
    // if (this.previewNextPoint) {
    //   fullPointsList.push(this.previewNextPoint);
    // }
    const pointsAsArray = this.inputPoints.map((p) => [p.x, p.y]);
    const fitted = fitCurve(pointsAsArray, this.simplificationFactor, () => {});
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

  public simplifySpline = (progress: number) => {
    this.simplificationFactor = Math.pow(progress, 5) * 500;
    this.updateControlPoints();
  };

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
      // this.updateAllWidthPoints();
      return;
    }

    this.pauseVideo();
    this.brushMode = true;
  };
}
