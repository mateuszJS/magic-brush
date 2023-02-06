import DrawSprite from "./DrawSprite";
import DrawShape from "./DrawShape";
// import DrawPrimitivePicking from "./DrawPrimitive/picking";

export let drawSprite: DrawSprite;
export let drawShape: DrawShape;
// export let drawPrimitivePicking: DrawPrimitivePicking;

export function compilePrograms() {
  drawSprite = new DrawSprite();
  drawShape = new DrawShape();
  // drawPrimitivePicking = new DrawPrimitivePicking();
}
