import DrawTexture3D from "./DrawTexture3D";
import DrawTexture from "./DrawTexture";
import DrawCircle from "./DrawCircle";
// import DrawPrimitivePicking from "./DrawPrimitive/picking";

export let drawTexture3D: DrawTexture3D;
export let drawTexture: DrawTexture;
export let drawCircle: DrawCircle;
export let drawCirclePick: DrawCircle;
// export let drawPrimitivePicking: DrawPrimitivePicking;

export function compilePrograms() {
  drawTexture3D = new DrawTexture3D();
  drawTexture = new DrawTexture();
  drawCircle = new DrawCircle(false);
  drawCirclePick = new DrawCircle(true);
  // drawPrimitivePicking = new DrawPrimitivePicking();
}
