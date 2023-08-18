import normalizeVec2 from "./normalizeVec2";

export default function getNormDirection(from: Point, to: Point) {
  return normalizeVec2({
    x: to.x - from.x,
    y: to.y - from.y,
  });
}
