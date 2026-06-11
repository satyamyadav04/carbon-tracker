import { useEffect, useState } from 'react';
import api from '../api/axios.js';

const AdminPanel = () => {
  const [summary, setSummary] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionPending, setActionPending] = useState(false);

  useEffect(() => {
    const fetchAdminData = async () => {
      setLoading(true);
      try {
        const [summaryResponse, usersResponse] = await Promise.all([
          api.get('/admin/summary'),
          api.get('/admin/users'),
        ]);
        setSummary(summaryResponse.data);
        setUsers(usersResponse.data);
      } catch (error) {
        window.dispatchEvent(new CustomEvent('carbonNotification', { detail: { message: error.response?.data?.message || 'Unable to load admin data', variant: 'error' } }));
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const toggleAdmin = async (userId, currentValue) => {
    setActionPending(true);
    try {
      await api.patch(`/admin/users/${userId}`, { isAdmin: !currentValue });
      setUsers((prev) => prev.map((item) => (item._id === userId ? { ...item, isAdmin: !currentValue } : item)));
      window.dispatchEvent(new CustomEvent('carbonNotification', { detail: { message: 'User role updated', variant: 'success' } }));
    } catch (error) {
      window.dispatchEvent(new CustomEvent('carbonNotification', { detail: { message: error.response?.data?.message || 'Failed to update role', variant: 'error' } }));
    } finally {
      setActionPending(false);
    }
  };

  return (
    <div className="page-grid">
      <section className="page-header">
        <h1>Admin Panel</h1>
        <p>Manage users, review usage metrics, and monitor system health in one place.</p>
      </section>

      {loading ? (
        <div className="grid cards-grid">
          <div className="skeleton-card" />
          <div className="skeleton-card" />
          <div className="skeleton-card" />
        </div>
      ) : (
        <div className="grid cards-grid">
          <div className="card summary-card">
            <h2>Total Users</h2>
            <p>{summary?.totalUsers ?? 0}</p>
          </div>
          <div className="card summary-card">
            <h2>Total Activities</h2>
            <p>{summary?.totalActivities ?? 0}</p>
          </div>
          <div className="card summary-card">
            <h2>Total Reports</h2>
            <p>{summary?.totalReports ?? 0}</p>
          </div>
          <div className="card summary-card">
            <h2>Total Carbon</h2>
            <p>{summary?.totalCarbonKg?.toFixed(1) ?? 0} kg</p>
          </div>
        </div>
      )}

      <div className="grid content-grid">
        <div className="card admin-card">
          <h2>Recent Users</h2>
          {loading ? (
            <div className="skeleton-list">
              <div className="skeleton-row" />
              <div className="skeleton-row" />
              <div className="skeleton-row" />
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.isAdmin ? 'Admin' : 'User'}</td>
                    <td>
                      <button type="button" disabled={actionPending} onClick={() => toggleAdmin(user._id, user.isAdmin)}>
                        {user.isAdmin ? 'Revoke Admin' : 'Grant Admin'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card admin-card">
          <h2>Recent Reports</h2>
          {loading ? (
            <div className="skeleton-list">
              <div className="skeleton-row" />
              <div className="skeleton-row" />
              <div className="skeleton-row" />
            </div>
          ) : (
            <ul className="admin-report-list">
              {summary?.recentReports?.slice(0, 5).map((report) => (
                <li key={report._id ?? report.id}>
                  <div>
                    <strong>{report.title}</strong>
                    <p>{report.reportType} • {new Date(report.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span>{report.totalCarbonKg?.toFixed(1)} kg</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
