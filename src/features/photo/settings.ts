import type { Grid } from "../../lib/types";
export type Tool = "crop" | "adjust" | "info";
export const ratios: Record<string, number | undefined> = {
  Free: undefined,
  Original: undefined,
  "1:1": 1,
  "4:3": 4 / 3,
  "3:2": 3 / 2,
  "16:9": 16 / 9,
  "4:5": 4 / 5,
  "9:16": 9 / 16,
};
export const gridNames: Record<Grid, string> = {
  none: "No grid",
  thirds: "Rule of thirds",
  golden: "Golden ratio",
  square: "5 × 5 grid",
};
