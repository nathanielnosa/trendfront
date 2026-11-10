import { useState, type PointerEvent } from "react";
import { formatCount } from "../../lib/format";
import "./Charts.css";

/** One point on the chart: a day and its number. */
export interface TrendPoint {
  date: string;
  value: number;
}

const WIDTH = 640;
const HEIGHT = 260;
const PAD = { left: 44, right: 12, top: 12, bottom: 28 };

/** Round a maximum up to a tidy number so the gridlines read cleanly (e.g. 37 becomes 40). */
function niceMax(value: number): number {
  if (value <= 4) return 4;
  // Small numbers: use an even maximum so the middle gridline is a whole number.
  if (value < 10) return Math.ceil(value / 2) * 2;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const step = magnitude / 2;
  return Math.ceil(value / step) * step;
}

/** Show a YYYY-MM-DD text as a short day, like "Nov 10". */
function shortDay(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/**
 * A single-series line chart with a soft area underneath.
 * Hover (or touch) shows a guide line and a tooltip for the nearest day.
 */
export function TrendChart({ points, label }: { points: TrendPoint[]; label: string }) {
  const [active, setActive] = useState<number | null>(null);

  const max = niceMax(Math.max(0, ...points.map((point) => point.value)));
  const innerWidth = WIDTH - PAD.left - PAD.right;
  const innerHeight = HEIGHT - PAD.top - PAD.bottom;

  /** Where a day sits across the chart. */
  const xAt = (index: number) =>
    points.length <= 1 ? PAD.left + innerWidth / 2 : PAD.left + (index / (points.length - 1)) * innerWidth;
  /** Where a number sits up the chart. */
  const yAt = (value: number) => PAD.top + innerHeight - (value / max) * innerHeight;

  const line = points.map((point, index) => `${index === 0 ? "M" : "L"}${xAt(index)},${yAt(point.value)}`).join(" ");
  const area = points.length
    ? `${line} L${xAt(points.length - 1)},${yAt(0)} L${xAt(0)},${yAt(0)} Z`
    : "";

  const ticks = [0, max / 2, max];
  const labelIndexes = points.length > 2 ? [0, Math.floor((points.length - 1) / 2), points.length - 1] : points.map((_, i) => i);

  /** Find the day nearest the pointer and make it the active one. */
  function onMove(event: PointerEvent<SVGRectElement>) {
    const box = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - box.left) / box.width) * innerWidth;
    const index = points.length <= 1 ? 0 : Math.round((x / innerWidth) * (points.length - 1));
    setActive(Math.min(points.length - 1, Math.max(0, index)));
  }

  const current = active !== null ? points[active] : null;

  return (
    <div className="chart">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={`${label} over time`} className="chart__svg">
        {ticks.map((tick) => (
          <g key={tick}>
            <line className="chart__grid" x1={PAD.left} x2={WIDTH - PAD.right} y1={yAt(tick)} y2={yAt(tick)} />
            <text className="chart__axis" x={PAD.left - 8} y={yAt(tick) + 4} textAnchor="end">
              {formatCount(tick)}
            </text>
          </g>
        ))}

        {area && <path className="chart__area" d={area} />}
        {line && <path className="chart__line" d={line} />}

        {labelIndexes.map((index) => (
          <text
            key={index}
            className="chart__axis"
            x={xAt(index)}
            y={HEIGHT - 8}
            textAnchor={index === 0 ? "start" : index === points.length - 1 ? "end" : "middle"}
          >
            {shortDay(points[index].date)}
          </text>
        ))}

        {current && active !== null && (
          <g>
            <line className="chart__guide" x1={xAt(active)} x2={xAt(active)} y1={PAD.top} y2={yAt(0)} />
            <circle className="chart__dot" cx={xAt(active)} cy={yAt(current.value)} r={5} />
          </g>
        )}

        <rect
          x={PAD.left}
          y={PAD.top}
          width={innerWidth}
          height={innerHeight}
          fill="transparent"
          onPointerMove={onMove}
          onPointerLeave={() => setActive(null)}
        />
      </svg>

      {current && active !== null && (
        <div
          className="chart__tip"
          style={{ left: `${(xAt(active) / WIDTH) * 100}%`, top: `${(yAt(current.value) / HEIGHT) * 100}%` }}
          role="status"
        >
          <strong>{formatCount(current.value)}</strong>
          <span>{shortDay(current.date)}</span>
        </div>
      )}
    </div>
  );
}
