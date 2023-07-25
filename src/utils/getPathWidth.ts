import State from "State";

/* globalT - between <0, state.simplePath.length / 3> */
export default function getPathWidth(globalT: number, state: State) {
  const totalGlobalT = state.simplePath.length / 3;
  const progress = globalT / totalGlobalT;
  const lowerPointThick = state.lineWidth.reduce(
    (acc, thickPoint) => (thickPoint.progress < progress ? thickPoint : acc),
    state.lineWidth[0]
  );
  const lowerPointThickIndex = state.lineWidth.indexOf(lowerPointThick);
  const upperPointThick = state.lineWidth[lowerPointThickIndex + 1];
  // find two array of state.lineWidth where progress is between them
  // 1. We need to map local t value to state.lineWidth
  const diff =
    (progress - lowerPointThick.progress) /
    (upperPointThick.progress - lowerPointThick.progress);
  const offsetAvg =
    (1 - diff) * lowerPointThick.offset + diff * upperPointThick.offset;

  return offsetAvg;
}
