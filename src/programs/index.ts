import DrawSprite from "./DrawSprite";
// import DrawPrimitive from "./DrawPrimitive";
// import DrawPrimitivePicking from "./DrawPrimitive/picking";

export let drawSprite: DrawSprite;
// export let drawPrimitive: DrawPrimitive;
// export let drawPrimitivePicking: DrawPrimitivePicking;

export function compilePrograms() {
  drawSprite = new DrawSprite();
  // drawPrimitive = new DrawPrimitive();
  // drawPrimitivePicking = new DrawPrimitivePicking();
}
