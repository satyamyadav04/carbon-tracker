const RANK_STYLES = [
  { bg: '#FAEEDA', color: '#854F0B' },
  { bg: '#D3D1C7', color: '#444441' },
  { bg: '#F5C4B3', color: '#993C1D' },
];

const BAR_COLORS = ['#EF9F27', '#888780', '#D85A30', '#378ADD', '#1D9E75'];

const Leaderboard = ({ leaders }) => {
  if (!leaders?.length) {
    return (
      <div className="card leaderboard-card">
        <h3>Leaderboard</h3>
        <p className="empty-text">No leaderboard data yet.</p>
      </div>
    );
  }

  const maxKg = Math.max(...leaders.map(l => l.totalCarbonKg));

  return (
    <div className="card leaderboard-card">
      <h3>🏆 Leaderboard</h3>
      <div style={{ marginTop: '8px' }}>
        {leaders.map((item, index) => {
          const pct = Math.round((item.totalCarbonKg / maxKg) * 100);
          const rankStyle = RANK_STYLES[index] || { bg: '#f0f0f0', color: '#666' };
          return (
            <div key={item.userId} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 0',
              borderBottom: index < leaders.length - 1 ? '0.5px solid #eee' : 'none'
            }}>
              {/* Rank badge */}
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: rankStyle.bg, color: rankStyle.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '13px', fontWeight: '500', flexShrink: 0
              }}>
                {index + 1}
              </div>

              {/* Name + bar */}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: '500' }}>{item.name}</div>
                <div style={{ height: '4px', background: '#eee', borderRadius: '4px', margin: '4px 0' }}>
                  <div style={{
                    width: `${pct}%`, height: '4px',
                    background: BAR_COLORS[index % BAR_COLORS.length],
                    borderRadius: '4px'
                  }} />
                </div>
                <div style={{ fontSize: '12px', color: '#999' }}>{item.activityCount} activities</div>
              </div>

              {/* Score */}
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '14px', fontWeight: '500' }}>{item.totalCarbonKg} kg</div>
                <div style={{ fontSize: '11px', color: '#999' }}>CO₂</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Leaderboard;