type TrendPoint = { label: string; sessions: number; leads: number };
type BreakdownItem = { label: string; value: number; detail?: string };
type FunnelItem = { label: string; value: number; rate: number; note: string };

export function TrafficTrend({ points }: { points: TrendPoint[] }) {
  const max = Math.max(1, ...points.map((point) => point.sessions));
  return (
    <div className="analytics-trend" role="img" aria-label="每日流量與詢問趨勢">
      {points.map((point) => (
        <div className="analytics-trend-day" key={point.label}>
          <div className="analytics-trend-bars">
            <span className="analytics-trend-session" style={{ height: `${Math.max(4, point.sessions / max * 100)}%` }} />
            {point.leads ? <span className="analytics-trend-lead" title={`${point.leads} 筆詢問`} /> : null}
          </div>
          <span>{point.label}</span>
        </div>
      ))}
    </div>
  );
}

export function Breakdown({ items, empty = "目前還沒有資料" }: { items: BreakdownItem[]; empty?: string }) {
  const max = Math.max(1, ...items.map((item) => item.value));
  if (!items.length) return <p className="analytics-empty">{empty}</p>;
  return (
    <div className="analytics-breakdown">
      {items.map((item) => (
        <div className="analytics-breakdown-row" key={item.label}>
          <div><strong>{item.label}</strong><span>{item.detail}</span></div>
          <div className="analytics-breakdown-track"><span style={{ width: `${item.value / max * 100}%` }} /></div>
          <b>{item.value.toLocaleString("zh-TW")}</b>
        </div>
      ))}
    </div>
  );
}

export function JourneyFunnel({ items }: { items: FunnelItem[] }) {
  return (
    <div className="analytics-funnel">
      {items.map((item, index) => (
        <div className="analytics-funnel-step" key={item.label}>
          <div className="analytics-funnel-index">{String(index + 1).padStart(2, "0")}</div>
          <div><span>{item.label}</span><strong>{item.value.toLocaleString("zh-TW")}</strong></div>
          <div className="analytics-funnel-rate"><b>{item.rate}%</b><span>{item.note}</span></div>
        </div>
      ))}
    </div>
  );
}
