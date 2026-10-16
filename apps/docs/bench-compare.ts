// How the site words a benchmark comparison. One rule, used by the panel's summary sentence and by the
// "where Devora.js is behind" list, so they cannot disagree:
//
//   Each framework's result is a range, the min and max of its runs. Two results are a TIE when their ranges
//   overlap: the difference is inside the run-to-run spread. A framework is only "ahead" or "behind" when its
//   whole range lies beyond the other's. A result with no spread (JavaScript bytes, which do not vary between
//   runs) is a single point.

export type Better = "lower" | "higher";
export interface Point { value: number; lo: number; hi: number }
export type Verdict =
  | { kind: "first"; best: string }
  | { kind: "tie"; with: string[] }
  | { kind: "behind"; leader: string };

export function point(value: number, spread?: { min: number; max: number }): Point {
  return { value, lo: spread?.min ?? value, hi: spread?.max ?? value };
}

const overlaps = (a: Point, b: Point) => a.lo <= b.hi && b.lo <= a.hi;
const strictlyBetter = (a: Point, b: Point, better: Better) => (better === "higher" ? a.lo > b.hi : a.hi < b.lo);

/** Devora.js against every other framework on one metric. */
export function judge(devora: Point, others: { name: string; point: Point }[], better: Better): Verdict {
  const beating = others.filter((o) => strictlyBetter(o.point, devora, better));
  if (beating.length > 0) {
    const leader = [...beating].sort((a, b) => (better === "higher" ? b.point.value - a.point.value : a.point.value - b.point.value))[0]!;
    return { kind: "behind", leader: leader.name };
  }
  const tied = others.filter((o) => overlaps(o.point, devora));
  return tied.length > 0 ? { kind: "tie", with: tied.map((o) => o.name) } : { kind: "first", best: "" };
}

export const join = (xs: string[]) => (xs.length > 1 ? `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}` : xs[0] ?? "nothing");
