import State from "State";
import getNearestIndex from "./getNearestIndex";

function easeInOutQuad(x: number): number {
  return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
}

export default function getPathWidth(progress: number, state: State) {
  // progress measured in segments
  const splineProgress = progress / state.segments.length;

  const nearestPointIndex = getNearestIndex(
    splineProgress,
    state.widthPoints,
    "progress"
  );
  const lowerPointThickIndex = // correcting index because:
    state.widthPoints[nearestPointIndex].progress >= splineProgress // we need closest BUT also smaller than progress
      ? Math.max(nearestPointIndex - 1, 0) // take previous item but make sure it's not under index -1
      : nearestPointIndex;

  const lowerPointThick = state.widthPoints[lowerPointThickIndex];
  const upperPointThick = state.widthPoints[lowerPointThickIndex + 1];

  const diff =
    (splineProgress - lowerPointThick.progress) /
    (upperPointThick.progress - lowerPointThick.progress);

  const easyDiff = easeInOutQuad(diff);
  const offsetAvg =
    (1 - easyDiff) * lowerPointThick.offset + easyDiff * upperPointThick.offset;

  return offsetAvg;
}
