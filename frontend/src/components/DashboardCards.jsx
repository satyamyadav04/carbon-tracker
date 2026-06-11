const DashboardCards = ({ data }) => (
  <div className="grid cards-grid">
    <article className="card summary-card">
      <h3>Total Carbon</h3>
      <p>{data?.totalCarbonKg ?? 0} kg CO2e</p>
      <div className="summary-accent">▲ Reduced 4.2% from last month</div>
    </article>
    <article className="card summary-card">
      <h3>Activities</h3>
      <p>{data?.activityCount ?? 0}</p>
      <div className="summary-accent">🕒 Recent activity: {data?.recentActivity || '—'}</div>
    </article>
    <article className="card summary-card">
      <h3>Avg Carbon</h3>
      <p>{data?.averageCarbonKg?.toFixed(2) ?? 0} kg</p>
      <div className="summary-accent">⚖️ Per activity</div>
    </article>
  </div>
);

export default DashboardCards;
