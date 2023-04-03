export default function douglasPeucker(
  points: Point[],
  epsilon: number
): Point[] {
  let dmax = 0;
  let index = 0;
  const end = points.length - 1;
  const result: Point[] = [];

  for (let i = 1; i < end; i++) {
    const d = perpendicularDistance(points[i], points[0], points[end]);

    if (d > dmax) {
      index = i;
      dmax = d;
    }
  }

  if (dmax > epsilon) {
    const left = douglasPeucker(points.slice(0, index + 1), epsilon);
    const right = douglasPeucker(points.slice(index), epsilon);
    result.push(...left.slice(0, -1), ...right);
  } else {
    result.push(points[0], points[end]);
  }

  return result;
}

function perpendicularDistance(point: Point, start: Point, end: Point): number {
  const { x: sx, y: sy } = start;
  const { x: ex, y: ey } = end;
  const { x, y } = point;

  const numerator = Math.abs((ey - sy) * x - (ex - sx) * y + ex * sy - ey * sx);
  const denominator = Math.sqrt(Math.pow(ey - sy, 2) + Math.pow(ex - sx, 2));
  return numerator / denominator;
}
