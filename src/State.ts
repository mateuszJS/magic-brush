import MiniatureVideo from "models/Video/MiniatureVideo";
import { updateToolbar } from "UI/createToolbar";
import { MS_PER_PIXEL } from "consts";
import { updateTimelineScroll, updateTimelineWidth } from "UI";
import douglasPeucker from "utils/douglasPeucker";
import computeControlPoints from "utils/computeControlPoints";
import getBezierPos from "utils/getBezierPos";
import getBezierTan from "utils/getBezierTan";
import distancePointToLine from "utils/distancePointToLine";
import getDistance from "utils/getDistance";
import getNormDirection from "utils/getNormDirection";

export interface WidthPoint {
  progress: number;
  offset: number;
}

export const DEFAULT_OFFSET = 80;

export default class State {
  private detailedPath: Point[]; // this is exactly path from user input
  private inProgressPoints: Point[];
  private previewNextPoint: Point | null;
  public brushMode: boolean;
  public simplePath: Point[];
  public currTime: number;
  public needsRefresh: boolean; // indicates if we should make an update or not
  public video: MiniatureVideo;
  public widthPoints: WidthPoint[];
  public simplificationFactor: number;

  constructor(videoUrl: string, onVideoLoaded: (state: State) => void) {
    this.currTime = 0;
    this.needsRefresh = true;
    this.brushMode = false;
    this.detailedPath = [];
    this.inProgressPoints = [];
    this.simplePath = [];
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
    const segmentsTotalProgress = this.simplePath.length / 3;
    const pathProgress = segmentProgress / segmentsTotalProgress;

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

  public getPosAndTan(segmentProgress: number) {
    const firstKnotIndex = Math.floor(segmentProgress) * 3;
    const maxKnotIndex = this.simplePath.length - 4;
    const [safeFirstKnotIndex, t] =
      firstKnotIndex > maxKnotIndex
        ? [maxKnotIndex, 1]
        : [firstKnotIndex, segmentProgress % 1];
    const p1 = this.simplePath[safeFirstKnotIndex + 0];
    const p2 = this.simplePath[safeFirstKnotIndex + 1];
    const p3 = this.simplePath[safeFirstKnotIndex + 2];
    const p4 = this.simplePath[safeFirstKnotIndex + 3];
    const pointOnCurve = getBezierPos(p1, p2, p3, p4, t);
    const curveTan = getBezierTan(p1, p2, p3, p4, t);

    return [pointOnCurve, curveTan];
  }

  public addControlPoint(pointer: Point, last = false) {
    const { detailedPath, inProgressPoints } = this;
    /*
    inProgressPoints array si used to store all the points which are in same direction.
    Direction is calc between last detailedPath point and first inProgressPoint.
    Once pointer is not on that line(not within direction), we add last correct point (last time of inProgressPoint)
    to detailedPath, and we add pointer to inProgressPoint since now we draw in a different direction
    */

    // TODO: we should reset inProgressPoints

    if (detailedPath.length === 0) {
      detailedPath.push(pointer);
      this.updateControlPoints();
      return;
    }

    const firstProgressPoint = inProgressPoints[0];
    const lastDetailPoint = detailedPath[detailedPath.length - 1];
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
        detailedPath[detailedPath.length - 1] = pointer;
        // the result should be same, and we won't get tow point almost overlapping(what created weird ending in the brush)
      } else {
        detailedPath.push(pointer);
      }
      this.updateControlPoints();
      return;
    }

    if (distanceFromLastDetailPoint < 50) return;

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
      detailedPath.push(lastProgressPoint);
      // at this time we for sure have the start and the end of the path, I bet that's why we use empty array
      this.inProgressPoints = []; // pointer should be 50px far from
      // this.inProgressPoints = [{ x, y }];
    } else {
      // new point is at the same direction
      inProgressPoints.push(pointer);

      // TODO: When mouse is up, probably we should add last point to detailed path
    }

    this.updateControlPoints();
  }

  private updateControlPoints() {
    const fullPointsList = [...this.detailedPath];

    // if (this.previewNextPoint) {
    //   fullPointsList.push(this.previewNextPoint);
    // }

    const knots = douglasPeucker(fullPointsList, this.simplificationFactor);

    const n = knots.length - 1;
    const controlPoints = computeControlPoints(n, knots);

    this.simplePath = [knots[0]];
    for (let i = 0; i < n; i++) {
      this.simplePath.push(controlPoints[i]);
      this.simplePath.push(controlPoints[n + i]);
      this.simplePath.push(knots[i + 1]);
    }

    // if (this.previewNextPoint) {
    //   const diff = {
    //     x: this.previewNextPoint.x - knots[n].x,
    //     y: this.previewNextPoint.y - knots[n].y,
    //   };
    //   const controlPoint1 = {
    //     x: this.previewNextPoint.x - diff.x * 0.1,
    //     y: this.previewNextPoint.y - diff.y * 0.1,
    //   };
    //   const lastControlPoint = this.simplePath[this.simplePath.length - 2];
    //   const direction = getNormDirection(lastControlPoint, knots[n]);
    //   const distance = getDistance(this.previewNextPoint, knots[n]);
    //   const controlPoint2 = {
    //     x: knots[n].x + direction.x * Math.min(50, distance * 0.8),
    //     y: knots[n].y + direction.y * Math.min(50, distance * 0.8),
    //   };

    //   this.simplePath.push(controlPoint2);
    //   this.simplePath.push(controlPoint1);
    //   this.simplePath.push(this.previewNextPoint);
    // }

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
