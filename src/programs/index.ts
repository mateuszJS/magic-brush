import DrawSprite from "./DrawSprite";
import DrawPrimitive from "./DrawPrimitive";
import DrawPrimitivePicking from "./DrawPrimitive/picking";

export let drawSprite: DrawSprite;
export let drawPrimitive: DrawPrimitive;
export let drawPrimitivePicking: DrawPrimitivePicking;

export function compilePrograms(gl: WebGL2RenderingContext) {
  drawSprite = new DrawSprite(gl);
  drawPrimitive = new DrawPrimitive(gl);
  drawPrimitivePicking = new DrawPrimitivePicking(gl);
}
