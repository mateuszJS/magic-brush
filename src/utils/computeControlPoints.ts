export default function computeControlPoints(n: number, knots: Point[]) {
  const result: Point[] = new Array(n * 2);

  const target: Point[] = constructTargetVector(n, knots);
  const lowerDiag: number[] = constructLowerDiagonalVector(n - 1);
  const mainDiag: number[] = constructMainDiagonalVector(n);
  const upperDiag: number[] = constructUpperDiagonalVector(n - 1);

  const newTarget: Point[] = new Array(n);
  const newUpperDiag: number[] = new Array(n - 1);

  // forward sweep for control points c_i,0:
  newUpperDiag[0] = upperDiag[0] / mainDiag[0];
  newTarget[0] = {
    x: target[0].x * (1 / mainDiag[0]),
    y: target[0].y * (1 / mainDiag[0]),
  };

  for (let i = 1; i < n - 1; i++) {
    newUpperDiag[i] =
      upperDiag[i] / (mainDiag[i] - lowerDiag[i - 1] * newUpperDiag[i - 1]);
  }

  for (let i = 1; i < n; i++) {
    const targetScale =
      1 / (mainDiag[i] - lowerDiag[i - 1] * newUpperDiag[i - 1]);

    newTarget[i] = {
      x: (target[i].x - newTarget[i - 1].x * lowerDiag[i - 1]) * targetScale,
      y: (target[i].y - newTarget[i - 1].y * lowerDiag[i - 1]) * targetScale,
    };
  }

  // backward sweep for control points c_i,0:
  result[n - 1] = newTarget[n - 1];

  for (let i = n - 2; i >= 0; i--) {
    result[i] = {
      x: newTarget[i].x - newUpperDiag[i] * result[i + 1].x,
      y: newTarget[i].y - newUpperDiag[i] * result[i + 1].y,
    };
  }

  // calculate remaining control points c_i,1 directly:
  for (let i = 0; i < n - 1; i++) {
    const knot = knots[i + 1];
    result[n + i] = {
      x: knot.x * 2 - result[i + 1].x,
      y: knot.y * 2 - result[i + 1].y,
    };
  }

  const lastKnot = knots[n];
  result[2 * n - 1] = {
    x: (lastKnot.x + result[n - 1].x) * 0.5,
    y: (lastKnot.y + result[n - 1].y) * 0.5,
  };

  return result;
}

function constructTargetVector(n: number, knots: Point[]): Point[] {
  const result: Point[] = new Array(n);

  result[0] = {
    x: knots[0].x + 2 * knots[1].x,
    y: knots[0].y + 2 * knots[1].y,
  };

  for (let i = 1; i < n - 1; i++) {
    const knot = knots[i];
    const nextKnot = knots[i + 1];
    result[i] = {
      x: (knot.x * 2 + nextKnot.x) * 2,
      y: (knot.y * 2 + nextKnot.y) * 2,
    };
  }
  const secondToLastKnot = knots[n - 1];
  const lastKnot = knots[n];

  result[result.length - 1] = {
    x: secondToLastKnot.x * 8 + lastKnot.x,
    y: secondToLastKnot.y * 8 + lastKnot.y,
  };

  return result;
}

function constructLowerDiagonalVector(length: number) {
  const result: number[] = new Array(length);

  for (let i = 0; i < result.length - 1; i++) {
    result[i] = 1;
  }

  result[result.length - 1] = 2;

  return result;
}

function constructMainDiagonalVector(n: number) {
  const result: number[] = new Array(n);

  result[0] = 2;

  for (let i = 1; i < result.length - 1; i++) {
    result[i] = 4;
  }

  result[result.length - 1] = 7;

  return result;
}

function constructUpperDiagonalVector(length: number) {
  const result: number[] = new Array(length);

  for (let i = 0; i < result.length; i++) {
    result[i] = 1;
  }

  return result;
}
