import { useEffect, useState } from 'react';
import api from '../api/axios.js';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [reportType, setReportType] = useState('monthly');
  const [message, setMessage] = useState('');

  const loadReports = async () => {
    setLoading(true);
    try {
      const response = await api.get('/reports/history');
      setReports(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const generateReport = async () => {
    setGenerating(true);
    setMessage('');
    try {
      await api.post('/reports', { reportType });
      setMessage('✅ Report generated successfully!');
      loadReports(); // history refresh karo
    } catch (err) {
      setMessage('❌ Failed to generate report. Try again.');
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const downloadReport = async (id) => {
    try {
      const response = await api.get(`/reports/download/${id}`, {
        responseType: 'blob', // ✅ PDF blob
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Download failed. Try again.');
      console.error(err);
    }
  };

  return (
    <div className="page-grid">
      <section className="page-header">
        <h1>Reports</h1>
        <p>Generate and download your sustainability reports.</p>
      </section>

      {/* Generate Report Card */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <h2>Generate New Report</h2>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '12px', flexWrap: 'wrap' }}>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-border-tertiary)', background: 'var(--color-background-secondary)', color: 'var(--color-text-primary)', fontSize: '14px' }}
          >
            <option value="today">Today</option>
            <option value="weekly">This Week</option>
            <option value="monthly">This Month</option>
          </select>

          <button
            onClick={generateReport}
            disabled={generating}
            style={{ padding: '8px 20px', borderRadius: '8px', background: '#1D9E75', color: '#fff', border: 'none', cursor: generating ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: '500', opacity: generating ? 0.7 : 1 }}
          >
            {generating ? 'Generating...' : '+ Generate Report'}
          </button>

          {message && (
            <span style={{ fontSize: '14px', color: message.startsWith('✅') ? '#1D9E75' : '#e11d48' }}>
              {message}
            </span>
          )}
        </div>
      </div>

      {/* Report History */}
      <div className="card report-history">
        <h2>Report History</h2>
        {loading ? (
          <div className="skeleton-list">
            <div className="skeleton-row" />
            <div className="skeleton-row" />
            <div className="skeleton-row" />
          </div>
        ) : reports.length === 0 ? (
          <p className="empty-text">No reports yet. Generate your first report above!</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {reports.map((report) => (
              <li key={report.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 0', borderBottom: '0.5px solid var(--color-border-tertiary)'
              }}>
                <div>
                  <div style={{ fontWeight: '500', color: 'var(--color-text-primary)', fontSize: '14px' }}>
                    {report.title}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '3px' }}>
                    {new Date(report.periodStart).toLocaleDateString()} — {new Date(report.periodEnd).toLocaleDateString()}
                    &nbsp;·&nbsp; {report.activityCount} activities &nbsp;·&nbsp; {report.totalCarbonKg} kg CO₂
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                    Generated: {new Date(report.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <button
                  onClick={() => downloadReport(report.id)}
                  style={{ padding: '6px 16px', borderRadius: '8px', background: 'var(--color-background-secondary)', color: 'var(--color-text-primary)', border: '0.5px solid var(--color-border-tertiary)', cursor: 'pointer', fontSize: '13px', whiteSpace: 'nowrap' }}
                >
                  ⬇ Download
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Reports;