import MiniatureVideo from "models/Video/MiniatureVideo";
import { updateToolbar } from "UI/createToolbar";
import { splitFloatIntoVec3 } from "utils/id";
import { MS_PER_PIXEL } from "consts";
import { updateTimelineScroll, updateTimelineWidth } from "UI";
import douglasPeucker from "utils/douglasPeucker";
import log from "utils/log";
import computeControlPoints from "utils/computeControlPoints";

interface HandlePoint {
  id: number;
  idVec4: vec4;
  x: number;
  y: number;
}

interface SnowEffect {
  curve: HandlePoint[];
}

function getAngleDiff(alpha: number, beta: number): number {
  const phi = Math.abs(beta - alpha) % (Math.PI * 2); // This is either the distance or 2*Math.PI - distance
  if (phi > Math.PI) {
    return Math.PI * 2 - phi;
  }
  return phi;
}

function distanceFromPointToLine(p: Point, l1: Point, l2: Point) {
  let A = l2.y - l1.y;
  let B = l1.x - l2.x;
  let C = l1.y * (l2.x - l1.x) - l1.x * (l2.y - l1.y);
  return Math.abs(A * p.x + B * p.y + C) / Math.sqrt(A * A + B * B);
}

export default class State {
  private brushMode: boolean;
  private drawPoints: Point[];
  public simplePath: Point[];
  public inProgressPoints: Point[];
  public snow: SnowEffect | null;
  public currTime: number;
  public needsRefresh: boolean; // indicates if we should make an update or not
  public video: MiniatureVideo;
  // related to mouse interactions
  public needsRefreshSelection: boolean;
  private mouseOffsetX: number;
  private mouseOffsetY: number;
  public testSelection: (state: State, x: number, y: number) => number;
  public selectedHandler: HandlePoint | null;
  private pointerIsDown: boolean;
  private lastEpsilon: number;

  constructor(videoUrl: string, onVideoLoaded: (state: State) => void) {
    this.snow = null;
    this.currTime = 0;
    this.needsRefresh = true;
    this.needsRefreshSelection = false;
    this.selectedHandler = null;
    this.mouseOffsetX = 0;
    this.mouseOffsetY = 0;
    this.testSelection = () => 0; // just fake function, placeholder
    this.brushMode = false;
    this.drawPoints = [];
    this.inProgressPoints = [];
    this.simplePath = [];
    this.pointerIsDown = false;
    this.lastEpsilon = 0.1;

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

  public onPointerDown = (x: number, y: number) => {
    this.pointerIsDown = true;
    const newSelectionId = this.testSelection(this, x, y);
    const newSelectedHandler = this.snow?.curve.find(
      (point) => point.id === newSelectionId
    );

    if (newSelectedHandler) {
      this.selectedHandler = newSelectedHandler;
      this.mouseOffsetX = newSelectedHandler.x - x;
      this.mouseOffsetY = newSelectedHandler.y - y;
      this.refresh();
    }
  };

  public onPointerUp = () => {
    this.selectedHandler = null;
    this.refresh();
    this.pointerIsDown = false;
  };

  private updatePath() {
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

  public onPointerMove = (x: number, y: number) => {
    if (this.brushMode) {
      if (!this.pointerIsDown) return;
      const { drawPoints, inProgressPoints } = this;

      if (!drawPoints.length) {
        drawPoints.push({ x, y });
        this.updatePath();
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
        this.updatePath();
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
      this.updatePath();
      this.refresh();
      return;
    }

    const handler = this.selectedHandler;
    if (handler) {
      handler.x = this.mouseOffsetX + x;
      handler.y = this.mouseOffsetY + y;
      this.refresh();
    }
  };

  public simplifySpline = (progress: number) => {
    this.lastEpsilon = Math.pow(progress, 5) * 500;
    this.updatePath();
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

  private addHandle(id: number, x: number, y: number) {
    this.snow?.curve.push({
      id,
      idVec4: splitFloatIntoVec3(id),
      x,
      y,
    });
  }

  public setBrushMode = () => {
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
