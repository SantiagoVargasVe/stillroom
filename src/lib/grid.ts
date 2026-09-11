import type { Grid } from "./types";

export function gridLines(grid: Grid): number[] {
  if (grid === "thirds") return [1 / 3, 2 / 3];
  if (grid === "golden") return [0.382, 0.618];
  if (grid === "square") return [0.2, 0.4, 0.6, 0.8];
  return [];
}
export function drawGrid(canvas: HTMLCanvasElement, grid: Grid) {
  const context = canvas.getContext("2d")!;
  const { width, height } = canvas;
  context.save();
  context.strokeStyle = "rgba(255,255,255,0.75)";
  context.shadowColor = "rgba(0,0,0,0.6)";
  context.shadowBlur = Math.max(1, width / 1000);
  context.lineWidth = Math.max(1, width / 1200);
  for (const n of gridLines(grid)) {
    context.beginPath();
    context.moveTo(n * width, 0);
    context.lineTo(n * width, height);
    context.stroke();
    context.beginPath();
    context.moveTo(0, n * height);
    context.lineTo(width, n * height);
    context.stroke();
  }
  context.restore();
}
