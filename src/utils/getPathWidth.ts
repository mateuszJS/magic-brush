import State from "State";
import getNearestIndex from "./getNearestIndex";

/* globalT - between <0, state.simplePath.length / 3> */
export default function getPathWidth(segmentProgress: number, state: State) {
  const totalSegmentProgress = state.simplePath.length / 3; // 3 because one segment contains 4 in total, by dividing by 3 we got number of segment(two nodes and tow control points)
  const progress = segmentProgress / totalSegmentProgress;

  const nearestPointIndex = getNearestIndex(
    progress,
    state.widthPoints,
    "progress"
  );
  const lowerPointThickIndex = // correcting index because:
    state.widthPoints[nearestPointIndex].progress >= progress // we need closest BUT also smaller than progress
      ? Math.max(nearestPointIndex - 1, 0) // take previous item but make sure it's not under index -1
      : nearestPointIndex;

  const lowerPointThick = state.widthPoints[lowerPointThickIndex];
  const upperPointThick = state.widthPoints[lowerPointThickIndex + 1];

  const diff =
    (progress - lowerPointThick.progress) /
    (upperPointThick.progress - lowerPointThick.progress);
  const offsetAvg =
    (1 - diff) * lowerPointThick.offset + diff * upperPointThick.offset;

  return offsetAvg;
}
