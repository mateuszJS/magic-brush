import MiniatureVideo from "models/Video/MiniatureVideo";
import { updateToolbar } from "UI/createToolbar";
import { splitFloatIntoVec3 } from "utils/id";
import { MS_PER_PIXEL } from "consts";
import { updateTimelineScroll, updateTimelineWidth } from "UI";
import douglasPeucker from "utils/douglasPeucker";
import log from "utils/log";
import computeControlPoints from "utils/computeControlPoints";
import getBezierPos from "utils/getBezierPos";
import getBezierTan from "utils/getBezierTan";
import distanceFromPointToLine from "utils/distanceFromPointToLine";
import getCurveLength from "utils/getCurveLength";
import getPathWidth from "utils/getPathWidth";

interface HandlePoint {
  id: number;
  idVec4: vec4;
  x: number;
  y: number;
}

interface ThickPoint {
  progress: number;
  offset: number;
}

export default class State {
  private brushMode: boolean;
  private drawPoints: Point[];
  public simplePath: Point[];
  public inProgressPoints: Point[];
  public currTime: number;
  public needsRefresh: boolean; // indicates if we should make an update or not
  public video: MiniatureVideo;
  // related to mouse interactions
  public needsRefreshSelection: boolean;
  private mouseOffsetX: number;
  private mouseOffsetY: number;
  public thickLine: [Point, Point] | null;
  public lineWidth: { progress: number; offset: number }[];
  private currEditProgress: number | null;

  // public selectedHandler: HandlePoint | null;
  // private pointerIsDown: boolean;
  private lastEpsilon: number;

  constructor(videoUrl: string, onVideoLoaded: (state: State) => void) {
    this.currTime = 0;
    this.needsRefresh = true;
    this.needsRefreshSelection = false;
    // this.selectedHandler = null;
    this.mouseOffsetX = 0;
    this.mouseOffsetY = 0;
    this.brushMode = false;
    this.drawPoints = [];
    this.inProgressPoints = [];
    this.simplePath = [];
    // this.pointerIsDown = false;
    this.lastEpsilon = 0.1;
    this.thickLine = null;
    this.lineWidth = [
      {
        offset: 30,
        progress: 0,
      },
      {
        offset: 120,
        progress: 0.5,
      },
      {
        offset: 30,
        progress: 1,
      },
    ];
    this.currEditProgress = null;

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

  public lostHover() {
    let needsRefresh = false;
    if (this.thickLine) {
      needsRefresh = true;
      this.thickLine = null;
    }

    /* more changes to reset */

    if (needsRefresh) {
      this.refresh();
    }
  }

  public handlePathPointerDown(
    pathProgress: number,
    pathOffset: number,
    pointerX: number,
    pointerY: number
  ) {
    if (this.currEditProgress === null) {
      this.currEditProgress = pathProgress;
    }

    const startPointIndex = Math.floor(pathProgress) * 3;
    const PRECISION = 10;
    let totalPathDistance = 0;
    let distanceFromBeginningPathToThickPoint = 0;

    for (let i = 0; i + 2 < this.simplePath.length - 1; i += 3) {
      const p1 = this.simplePath[i + 0];
      const p2 = this.simplePath[i + 1];
      const p3 = this.simplePath[i + 2];
      const p4 = this.simplePath[i + 3];
      const distances = getCurveLength(p1, p2, p3, p4, PRECISION);

      if (i === startPointIndex) {
        const localProgress = pathProgress % 1; // <0, 1>, t

        const topIndex = Math.ceil(localProgress * PRECISION);
        const bottomIndex = Math.floor(localProgress * PRECISION);
        const diff = localProgress * PRECISION - bottomIndex; // <0, 1>
        // not sure if above line is not same as startPointIndex actually
        const distanceAvg =
          (1 - diff) * distances[bottomIndex] + diff * distances[topIndex];

        distanceFromBeginningPathToThickPoint = totalPathDistance + distanceAvg;
      }

      /* MAKE WE CAN EXTRACT IT TO SEPARATE FUNCTION, actually getCurveLength is used only within this function!
      const getTexCoord = (t: number) => {
        const topIndex = Math.ceil(t * TEX_COORD_PRECISION);
        const bottomIndex = Math.floor(t * TEX_COORD_PRECISION);
        const diff = t * TEX_COORD_PRECISION - bottomIndex; // <0, 1>
        const distanceAvg =
          (1 - diff) * distances[bottomIndex] + diff * distances[topIndex];
        const offset = i === 0 ? splineOffset : 0; // just an additional effect to animate the brush
        return prevTexCoordYoffset + distanceAvg / thickness + offset;
      };
      */

      totalPathDistance += distances[distances.length - 1];
    }

    const realAbsoluteProgress =
      distanceFromBeginningPathToThickPoint / totalPathDistance;

    // const currEditedLineWidth = this.lineWidth.find(point => Math.abs(point.progress - realAbsoluteProgress) < ) // seems like it should be an absolute value
    // this.lineWidth.push({
    //   progress: pathProgress,
    //   offset: pathOffset,
    // })
    // this.currEditProgress = 0

    //   const [pointOnCurve, curveTan] = this.getPosAndTan(pathProgress)
    //   const dist = Math.hypot(pointerX - pointOnCurve.x, pointerY - pointOnCurve.y)

    //   this.lineWidth[this.currEditProgress].offset = dist

    // t is const here, stored while first time the pointer is down, you cannot change it!
    /*
    if thickLine doesn't exists, then create one here
    */
    // TODO: think how are we going to store the data about thickness, it needs to work along the smoothness feature
    // like stored in some absolute t?
    // I think best is store like progress<0, 1> against whole path
    // if we change the smoothness factor, then progress stays the same
    // const relativePathProgress = pathProgress against path length
    // this oen cannot depend on nubmer of points like "pathProgress" does
    // index = this.thickness. // find the closes point with progress same as pathProgress
    // this.thickness = [
    //   this.thickness.slice(0, index),
    //   { progress: pathProgress, offset: pathoffset },
    //   this.thickness.slice(index)
    // ]
  }

  private getPosAndTan(pathProgress: number) {
    const curveIndex = Math.floor(pathProgress) * 3;
    const p1 = this.simplePath[curveIndex + 0];
    const p2 = this.simplePath[curveIndex + 1];
    const p3 = this.simplePath[curveIndex + 2];
    const p4 = this.simplePath[curveIndex + 3];
    const t = pathProgress % 1;
    const pointOnCurve = getBezierPos(p1, p2, p3, p4, t);
    const curveTan = getBezierTan(p1, p2, p3, p4, t);

    return [pointOnCurve, curveTan];
  }

  public handlePathHover(pathProgress: number, pathOffset: number) {
    // pathProgress -> relative distance measured in number of points form the start <0, infinity>?
    // pathOffset -> <0, 1>

    /*
    TODO:
    1. Look if there is a already thickness control point that we are hovering,
    search by t, user doesn't have to hover exactly the control point, can be any space between those points
    2. If we are not close to any existing thickness control points, then select a new one
    */
    const [pointOnCurve, curveTan] = this.getPosAndTan(pathProgress);
    // maybe we should move above to preview/pick. Since it's more there related than to State
    const offset = Math.abs(pathOffset - 0.5) * 2;
    const width = getPathWidth(pathProgress, this);
    const l1 = {
      x: pointOnCurve.x - curveTan.y * width * offset, // IT WON"T BE ALWAYS 100! it will be actual thickness in this particular point on the path
      y: pointOnCurve.y + curveTan.x * width * offset,
    };

    const l2 = {
      x: pointOnCurve.x + curveTan.y * width * offset,
      y: pointOnCurve.y - curveTan.x * width * offset,
    };

    this.thickLine = [l1, l2];
  }

  public addControlPoint(x: number, y: number) {
    if (this.brushMode) {
      // if (!this.pointerIsDown) return;
      const { drawPoints, inProgressPoints } = this;

      if (!drawPoints.length) {
        drawPoints.push({ x, y });
        this.updateControlPoints();
        return;
      }

      const lastDrawPoint = drawPoints[drawPoints.length - 1];
      // if (x === lastDrawPoint.x && y === lastDrawPoint.y) return;
      const distanceFromLastDrawPoint = Math.hypot(
        lastDrawPoint.x - x,
        lastDrawPoint.y - y
      );
      if (distanceFromLastDrawPoint < 50) return;

      if (!inProgressPoints.length) {
        inProgressPoints.push({ x, y });
        this.updateControlPoints();
        return;
      }

      const firstProgressPoint = inProgressPoints[0];
      if (x === firstProgressPoint.x && y === firstProgressPoint.y) return; // do we still need that with condition below?

      const deviationFromTheDirection = distanceFromPointToLine(
        { x, y },
        lastDrawPoint,
        firstProgressPoint
      );

      if (deviationFromTheDirection > 5) {
        // newest point has a different direction
        const lastProgressPoint = inProgressPoints[inProgressPoints.length - 1];
        drawPoints.push(lastProgressPoint);
        this.inProgressPoints = [];
        // this.inProgressPoints = [{ x, y }];
      } else {
        // new point is at the same direction
        inProgressPoints.push({ x, y });
      }
      this.updateControlPoints();
      this.refresh();
      return;
    }

    // this.getHover(x, y);

    // const handler = this.selectedHandler;
    // if (handler) {
    //   handler.x = this.mouseOffsetX + x;
    //   handler.y = this.mouseOffsetY + y;
    //   this.refresh();
    // }
  }

  private updateControlPoints() {
    const fullPointsList = [...this.drawPoints];
    const lastDrawPoint =
      this.inProgressPoints[this.inProgressPoints.length - 1];

    if (lastDrawPoint) {
      fullPointsList.push(lastDrawPoint);
    }

    const simplifiedPoints = douglasPeucker(fullPointsList, this.lastEpsilon);

    const n = simplifiedPoints.length - 1;
    const controlPoints = computeControlPoints(n, simplifiedPoints);

    this.simplePath = [simplifiedPoints[0]];
    for (let i = 0; i < n; i++) {
      this.simplePath.push(controlPoints[i]);
      this.simplePath.push(controlPoints[n + i]);
      this.simplePath.push(simplifiedPoints[i + 1]);
    }

    this.refresh();
  }

  public simplifySpline = (progress: number) => {
    this.lastEpsilon = Math.pow(progress, 5) * 500;
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

  // private addHandle(id: number, x: number, y: number) {
  //   this.snow?.curve.push({
  //     id,
  //     idVec4: splitFloatIntoVec3(id),
  //     x,
  //     y,
  //   });
  // }

  public setBrushMode = () => {
    if (this.brushMode) {
      this.brushMode = false;
      return;
    }

    this.pauseVideo();
    this.brushMode = true;
    // this.snow = {
    //   curve: [],
    // };
    // this.addHandle(1, 50, 200);
    // this.addHandle(2, 100, 130);
    // this.addHandle(3, 400, 100);
    // this.addHandle(4, 450, 200);
  };
}
