import { useEffect, useState } from 'react';
import api from '../api/axios.js';
import DashboardCards from '../components/DashboardCards.jsx';
import CarbonPieChart from '../components/CarbonPieChart.jsx';
import Leaderboard from '../components/Leaderboard.jsx';

const Dashboard = () => {
  const [summary, setSummary] = useState({});
  const [pieData, setPieData] = useState(null);
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [summaryRes, pieRes, leaderboardRes] = await Promise.all([
          api.get('/analytics/total-carbon'),
          api.get('/analytics/pie'),
          api.get('/analytics/leaderboard'),
        ]);

        setSummary(summaryRes.data);
        setPieData(pieRes.data);
        setLeaders(leaderboardRes.data.topUsers || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  return (
    <div className="page-grid">
      <section className="page-header">
        <h1>Dashboard</h1>
        <p>Overview of your carbon footprint and sustainability score.</p>
      </section>
      {loading ? (
        <div className="grid cards-grid">
          <div className="skeleton-card" />
          <div className="skeleton-card" />
          <div className="skeleton-card" />
        </div>
      ) : (
        <DashboardCards data={summary} />
      )}
      <div className="grid chart-grid">
        <CarbonPieChart data={pieData} />
        <Leaderboard leaders={leaders} />
      </div>
    </div>
  );
};

export default Dashboard;
