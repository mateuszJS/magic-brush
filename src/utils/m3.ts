export function multiply(a: Matrix3, b: Matrix3): Matrix3 {
  const a00 = a[0 * 3 + 0];
  const a01 = a[0 * 3 + 1];
  const a02 = a[0 * 3 + 2];
  const a10 = a[1 * 3 + 0];
  const a11 = a[1 * 3 + 1];
  const a12 = a[1 * 3 + 2];
  const a20 = a[2 * 3 + 0];
  const a21 = a[2 * 3 + 1];
  const a22 = a[2 * 3 + 2];
  const b00 = b[0 * 3 + 0];
  const b01 = b[0 * 3 + 1];
  const b02 = b[0 * 3 + 2];
  const b10 = b[1 * 3 + 0];
  const b11 = b[1 * 3 + 1];
  const b12 = b[1 * 3 + 2];
  const b20 = b[2 * 3 + 0];
  const b21 = b[2 * 3 + 1];
  const b22 = b[2 * 3 + 2];

  return [
    b00 * a00 + b01 * a10 + b02 * a20,
    b00 * a01 + b01 * a11 + b02 * a21,
    b00 * a02 + b01 * a12 + b02 * a22,
    b10 * a00 + b11 * a10 + b12 * a20,
    b10 * a01 + b11 * a11 + b12 * a21,
    b10 * a02 + b11 * a12 + b12 * a22,
    b20 * a00 + b21 * a10 + b22 * a20,
    b20 * a01 + b21 * a11 + b22 * a21,
    b20 * a02 + b21 * a12 + b22 * a22,
  ];
}

export function identity(): Matrix3 {
  return [1, 0, 0, 0, 1, 0, 0, 0, 1];
}

/**
 * Creates a 2D projection matrix
 * @param {number} width width in pixels
 * @param {number} height height in pixels
 * @return {module:webgl-2d-math.Matrix3} a projection matrix that converts from pixels to clipspace with Y = 0 at the top.
 * @memberOf module:webgl-2d-math
 */
export function projection(width: number, height: number): Matrix3 {
  // https://webglfundamentals.org/webgl/lessons/webgl-2d-matrices.html
  return [2 / width, 0, 0, 0, 2 / height, 0, -1, -1, 1];
}

/**
 * Creates a 2D projection matrix
 * @param {number} width width in pixels
 * @param {number} height height in pixels
 * @return {module:webgl-2d-math.Matrix3} a projection matrix that converts from pixels to clipspace with Y = 0 at the top.
 * @memberOf module:webgl-2d-math
 */
export function projectionFlipY(width: number, height: number): Matrix3 {
  // https://webglfundamentals.org/webgl/lessons/webgl-2d-matrices.html
  // Note: This matrix flips the Y axis so 0 is at the top.
  return [2 / width, 0, 0, 0, -2 / height, 0, -1, 1, 1];
}

/**
 * Multiplies by a 2D projection matrix
 * @param {module:webgl-2d-math.Matrix3} the matrix to be multiplied
 * @param {number} width width in pixels
 * @param {number} height height in pixels
 * @return {module:webgl-2d-math.Matrix3} the result
 * @memberOf module:webgl-2d-math
 */
export function projectFlipY(
  m: Matrix3,
  width: number,
  height: number
): Matrix3 {
  return multiply(m, projectionFlipY(width, height));
}

/**
 * Creates a 2D translation matrix
 * @param {number} tx amount to translate in x
 * @param {number} ty amount to translate in y
 * @param {module:webgl-2d-math.Matrix4} [dst] optional matrix to store result
 * @return {module:webgl-2d-math.Matrix3} a translation matrix that translates by tx and ty.
 * @memberOf module:webgl-2d-math
 */
export function translation(tx: number, ty: number): Matrix3 {
  return [1, 0, 0, 0, 1, 0, tx, ty, 1];
}

/**
 * Multiplies by a 2D translation matrix
 * @param {module:webgl-2d-math.Matrix3} the matrix to be multiplied
 * @param {number} tx amount to translate in x
 * @param {number} ty amount to translate in y
 * @return {module:webgl-2d-math.Matrix3} the result
 * @memberOf module:webgl-2d-math
 */
export function translate(m: Matrix3, tx: number, ty: number) {
  return multiply(m, translation(tx, ty));
}

/**
 * Creates a 2D rotation matrix
 * @param {number} angleInRadians amount to rotate in radians
 * @return {module:webgl-2d-math.Matrix3} a rotation matrix that rotates by angleInRadians
 * @memberOf module:webgl-2d-math
 */
export function rotation(angleInRadians: number): Matrix3 {
  const c = Math.cos(angleInRadians);
  const s = Math.sin(angleInRadians);
  return [c, -s, 0, s, c, 0, 0, 0, 1];
}

/**
 * Multiplies by a 2D rotation matrix
 * @param {module:webgl-2d-math.Matrix3} the matrix to be multiplied
 * @param {number} angleInRadians amount to rotate in radians
 * @return {module:webgl-2d-math.Matrix3} the result
 * @memberOf module:webgl-2d-math
 */
export function rotate(m: Matrix3, angleInRadians: number): Matrix3 {
  return multiply(m, rotation(angleInRadians));
}

/**
 * Creates a 2D scaling matrix
 * @param {number} sx amount to scale in x
 * @param {number} sy amount to scale in y
 * @param {module:webgl-2d-math.Matrix4} [dst] optional matrix to store result
 * @return {module:webgl-2d-math.Matrix3} a scale matrix that scales by sx and sy.
 * @memberOf module:webgl-2d-math
 */
export function scaling(sx: number, sy: number): Matrix3 {
  return [sx, 0, 0, 0, sy, 0, 0, 0, 1];
}

/**
 * Multiplies by a 2D scaling matrix
 * @param {module:webgl-2d-math.Matrix3} the matrix to be multiplied
 * @param {number} sx amount to scale in x
 * @param {number} sy amount to scale in y
 * @return {module:webgl-2d-math.Matrix3} the result
 * @memberOf module:webgl-2d-math
 */
export function scale(m: Matrix3, sx: number, sy: number) {
  return multiply(m, scaling(sx, sy));
}

export function dot(x1: number, y1: number, x2: number, y2: number) {
  return x1 * x2 + y1 * y2;
}

export function normalize(x: number, y: number) {
  var l = Math.hypot(x, y);
  if (l > 0.00001) {
    return [x / l, y / l];
  } else {
    return [0, 0];
  }
}

// i = incident
// n = normal
export function reflect(ix: number, iy: number, nx: number, ny: number) {
  // I - 2.0 * dot(N, I) * N.
  var d = dot(nx, ny, ix, iy);
  return [ix - 2 * d * nx, iy - 2 * d * ny];
}

export function radToDeg(r: number) {
  return (r * 180) / Math.PI;
}

export function degToRad(d: number) {
  return (d * Math.PI) / 180;
}

export function transformPoint(m: Matrix3, v: Matrix3) {
  var v0 = v[0];
  var v1 = v[1];
  var d = v0 * m[0 * 3 + 2] + v1 * m[1 * 3 + 2] + m[2 * 3 + 2];
  return [
    (v0 * m[0 * 3 + 0] + v1 * m[1 * 3 + 0] + m[2 * 3 + 0]) / d,
    (v0 * m[0 * 3 + 1] + v1 * m[1 * 3 + 1] + m[2 * 3 + 1]) / d,
  ];
}

export function inverse(m: Matrix3) {
  const m00 = m[0 * 3 + 0];
  const m01 = m[0 * 3 + 1];
  const m02 = m[0 * 3 + 2];
  const m10 = m[1 * 3 + 0];
  const m11 = m[1 * 3 + 1];
  const m12 = m[1 * 3 + 2];
  const m20 = m[2 * 3 + 0];
  const m21 = m[2 * 3 + 1];
  const m22 = m[2 * 3 + 2];

  const b01 = m22 * m11 - m12 * m21;
  const b11 = -m22 * m10 + m12 * m20;
  const b21 = m21 * m10 - m11 * m20;

  const det = m00 * b01 + m01 * b11 + m02 * b21;
  const invDet = 1.0 / det;

  return [
    b01 * invDet,
    (-m22 * m01 + m02 * m21) * invDet,
    (m12 * m01 - m02 * m11) * invDet,
    b11 * invDet,
    (m22 * m00 - m02 * m20) * invDet,
    (-m12 * m00 + m02 * m10) * invDet,
    b21 * invDet,
    (-m21 * m00 + m01 * m20) * invDet,
    (m11 * m00 - m01 * m10) * invDet,
  ];
}
