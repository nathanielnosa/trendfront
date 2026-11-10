import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { BarList } from "../../components/charts/BarList";
import { TrendChart } from "../../components/charts/TrendChart";
import { ChipNav, type Chip } from "../../components/blog/ChipNav";
import { EmptyNotice, ErrorNotice } from "../../components/StateMessage";
import { Button, Card, Skeleton } from "../../components/ui";
import { useAnalyticsSummary, useTopEngaged, useTopViewed, useTrafficTrends } from "../../lib/api/analytics";
import { formatCount } from "../../lib/format";
import "../Listing.css";
import "./Analytics.css";

/** The date ranges an editor can pick, in days. */
const RANGES = [7, 30, 90];

/** What the traffic chart can show. */
const METRICS = [
  { value: "views", label: "Views" },
  { value: "engagements", label: "Engagement" },
  { value: "all", label: "All activity" },
] as const;

/**
 * The editor's numbers: headline tiles, a traffic chart you can switch between
 * views, engagement and all activity, and the best-performing posts.
 */
export function Analytics() {
  const [params] = useSearchParams();
  const days = RANGES.includes(Number(params.get("days"))) ? Number(params.get("days")) : 30;
  const metric = METRICS.find((item) => item.value === params.get("metric"))?.value ?? "views";
  const [showTable, setShowTable] = useState(false);

  const summary = useAnalyticsSummary();
  const traffic = useTrafficTrends(days);
  const topViewed = useTopViewed();
  const topEngaged = useTopEngaged();

  /** Build a link that changes one filter and keeps the other. */
  const link = (next: { days?: number; metric?: string }) =>
    `/desk/analytics?days=${next.days ?? days}&metric=${next.metric ?? metric}`;

  const rangeChips: Chip[] = RANGES.map((value) => ({
    label: `${value} days`,
    to: link({ days: value }),
    active: value === days,
  }));
  const metricChips: Chip[] = METRICS.map((item) => ({
    label: item.label,
    to: link({ metric: item.value }),
    active: item.value === metric,
  }));

  /** Pick the number for the chosen metric out of one day of data. */
  const pick = (day: { total_events: number; post_views: number; engagements: number }) =>
    metric === "views" ? day.post_views : metric === "engagements" ? day.engagements : day.total_events;

  const points = (traffic.data ?? []).map((day) => ({ date: day.date, value: pick(day) }));
  const total = points.reduce((sum, point) => sum + point.value, 0);
  const metricLabel = METRICS.find((item) => item.value === metric)?.label ?? "Views";

  const tiles = summary.data
    ? [
        { label: "Post views", value: summary.data.post_views },
        { label: "Reactions", value: summary.data.reactions },
        { label: "Comments", value: summary.data.comments },
        { label: "Shares", value: summary.data.shares },
        { label: "Bookmarks", value: summary.data.bookmarks },
        { label: "Posts published", value: summary.data.post_publications },
      ]
    : [];

  return (
    <div className="listing">
      <header className="listing__header">
        <h1>Analytics</h1>
        <p className="listing__lead">
          {summary.data ? `${formatCount(summary.data.events_today)} events today.` : "How the site is doing."}
        </p>
      </header>

      {summary.error && <ErrorNotice message="We could not load the summary." onRetry={() => void summary.refetch()} />}
      <div className="stats">
        {summary.isPending && [0, 1, 2, 3, 4, 5].map((n) => <Skeleton key={n} height="5rem" />)}
        {tiles.map((tile) => (
          <Card key={tile.label} className="stat">
            <span className="muted">{tile.label}</span>
            <strong className="stat__value">{formatCount(tile.value)}</strong>
          </Card>
        ))}
      </div>

      <Card className="panel-chart">
        <div className="panel-chart__head">
          <div>
            <h2>{metricLabel}</h2>
            <p className="muted">
              {formatCount(total)} in the last {days} days
            </p>
          </div>
          <div className="panel-chart__filters">
            <ChipNav label="Metric" chips={metricChips} />
            <ChipNav label="Range" chips={rangeChips} />
          </div>
        </div>

        {traffic.isPending && <Skeleton height="16rem" />}
        {traffic.error && <ErrorNotice message="We could not load the traffic." onRetry={() => void traffic.refetch()} />}
        {traffic.data && <TrendChart points={points} label={metricLabel} />}

        {traffic.data && (
          <>
            <Button size="sm" variant="ghost" onClick={() => setShowTable((value) => !value)} aria-expanded={showTable}>
              {showTable ? "Hide table" : "View as table"}
            </Button>
            {showTable && (
              <table className="analytics-table">
                <thead>
                  <tr>
                    <th scope="col">Day</th>
                    <th scope="col">{metricLabel}</th>
                  </tr>
                </thead>
                <tbody>
                  {points.map((point) => (
                    <tr key={point.date}>
                      <th scope="row">{point.date}</th>
                      <td>{formatCount(point.value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </Card>

      <div className="tops">
        <Card className="panel-chart">
          <h2>Most viewed</h2>
          {topViewed.isPending && <Skeleton height="10rem" />}
          {topViewed.error && <ErrorNotice message="We could not load this list." onRetry={() => void topViewed.refetch()} />}
          {topViewed.data && topViewed.data.length === 0 && <EmptyNotice title="No views yet">Views will appear here.</EmptyNotice>}
          {topViewed.data && topViewed.data.length > 0 && (
            <BarList
              rows={topViewed.data.map((post) => ({
                id: post.post_id,
                label: post.title,
                to: `/posts/${post.slug}`,
                value: post.total_views ?? 0,
              }))}
            />
          )}
        </Card>

        <Card className="panel-chart">
          <h2>Most engaged</h2>
          {topEngaged.isPending && <Skeleton height="10rem" />}
          {topEngaged.error && <ErrorNotice message="We could not load this list." onRetry={() => void topEngaged.refetch()} />}
          {topEngaged.data && topEngaged.data.length === 0 && (
            <EmptyNotice title="No engagement yet">Reactions, comments, shares and bookmarks will appear here.</EmptyNotice>
          )}
          {topEngaged.data && topEngaged.data.length > 0 && (
            <BarList
              rows={topEngaged.data.map((post) => ({
                id: post.post_id,
                label: post.title,
                to: `/posts/${post.slug}`,
                value: post.total_engagements ?? 0,
              }))}
            />
          )}
        </Card>
      </div>
    </div>
  );
}
