import DrawTexture3D from "./DrawTexture3D";
import DrawTexture from "./DrawTexture";
import DrawCircle from "./DrawCircle";
import DrawBezier from "./DrawBezier";
import SimpleDrawBezier from "./SimpleDrawBezier";
import DrawPoints from "./DrawPoints";
import DrawLine from "./DrawLine";
// import DrawPrimitivePicking from "./DrawPrimitive/picking";

export let drawTexture3D: DrawTexture3D;
export let drawTexture: DrawTexture;
export let drawCircle: DrawCircle;
export let drawCirclePick: DrawCircle;
export let drawBezier: DrawBezier;
export let drawBezierPick: DrawBezier;
export let simpleDrawBezier: SimpleDrawBezier;
export let drawPoints: DrawPoints;
export let drawLine: DrawLine;
// export let drawPrimitivePicking: DrawPrimitivePicking;

export function compilePrograms() {
  drawTexture3D = new DrawTexture3D();
  drawTexture = new DrawTexture();
  drawCircle = new DrawCircle(false);
  drawCirclePick = new DrawCircle(true);
  drawBezier = new DrawBezier(false);
  drawBezierPick = new DrawBezier(true);
  simpleDrawBezier = new SimpleDrawBezier();
  drawPoints = new DrawPoints();
  drawLine = new DrawLine();
  // drawPrimitivePicking = new DrawPrimitivePicking();
}
