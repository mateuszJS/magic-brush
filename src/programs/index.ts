import DrawTexture3D from "./DrawTexture3D";
import DrawTexture from "./DrawTexture";
import DrawShape from "./DrawShape";
// import DrawPrimitivePicking from "./DrawPrimitive/picking";

export let drawTexture3D: DrawTexture3D;
export let drawTexture: DrawTexture;
export let drawShape: DrawShape;
// export let drawPrimitivePicking: DrawPrimitivePicking;

export function compilePrograms() {
  drawTexture3D = new DrawTexture3D();
  drawTexture = new DrawTexture();
  drawShape = new DrawShape();
  // drawPrimitivePicking = new DrawPrimitivePicking();
}
