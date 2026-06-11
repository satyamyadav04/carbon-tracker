import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#378ADD', '#1D9E75', '#EF9F27', '#D4537E', '#534AB7', '#D85A30'];

const CarbonPieChart = ({ data }) => {
  if (!data?.values?.length) {
    return (
      <div className="card chart-card">
        <h3>Emissions breakdown</h3>
        <p className="empty-text">No emissions data yet.</p>
      </div>
    );
  }

  const total = data.values.reduce((s, v) => s + v.carbonKg, 0);

  return (
    <div className="card chart-card">
      <h3>Emissions breakdown</h3>

      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={data.values}
            dataKey="carbonKg"
            nameKey="activityType"
            cx="50%" cy="50%"
            outerRadius={90}
            innerRadius={50}
            paddingAngle={3}
          >
            {data.values.map((entry, index) => (
              <Cell key={entry.activityType} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [`${value} kg`, 'Emissions']}
            contentStyle={{
              background: 'var(--color-background-primary)',
              border: '0.5px solid var(--color-border-tertiary)',
              borderRadius: '8px',
              color: 'var(--color-text-primary)',        // ✅ dark mode safe
            }}
            labelStyle={{ color: 'var(--color-text-primary)' }}
          />
          <Legend iconType="circle" iconSize={8} />
        </PieChart>
      </ResponsiveContainer>

      {/* Breakdown cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '12px' }}>
        {data.values.map((item, index) => {
          const pct = ((item.carbonKg / total) * 100).toFixed(1);
          return (
            <div key={item.activityType} style={{
              background: 'var(--color-background-secondary)',   // ✅ dark mode safe
              borderRadius: '8px',
              padding: '10px 12px',
              borderLeft: `3px solid ${COLORS[index % COLORS.length]}`
            }}>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                {item.activityType}
              </div>
              <div style={{ fontSize: '18px', fontWeight: '500', color: 'var(--color-text-primary)' }}>
                {item.carbonKg} kg
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                {pct}% of total
              </div>
            </div>
          );
        })}
      </div>

      {/* Total bar */}
      <div style={{ marginTop: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
          <span>Total</span>
          <strong style={{ color: 'var(--color-text-primary)' }}>{total.toFixed(2)} kg CO₂</strong>
        </div>
        <div style={{ height: '8px', borderRadius: '4px', overflow: 'hidden', display: 'flex', background: 'var(--color-background-secondary)' }}>
          {data.values.map((item, index) => (
            <div key={item.activityType} style={{
              width: `${(item.carbonKg / total * 100).toFixed(1)}%`,
              background: COLORS[index % COLORS.length],
              height: '8px'
            }} />
          ))}
        </div>
      </div>

    </div>
  );
};

export default CarbonPieChart;