export default function getRectCoords(
  x: number,
  y: number,
  width: number,
  height: number
) {
  var x1 = x;
  var x2 = x + width;
  var y1 = y;
  var y2 = y + height;
  return [x1, y1, x2, y1, x1, y2, x1, y2, x2, y1, x2, y2];
}
