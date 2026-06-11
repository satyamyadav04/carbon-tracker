import { useEffect, useState } from 'react';
import api from '../api/axios.js';
import ActivityForm from '../components/ActivityForm.jsx';

const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadActivities = async () => {
    setLoading(true);
    try {
      const response = await api.get('/activities');
      setActivities(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, []);

  const handleCreate = async (activityData) => {
    try {
      await api.post('/activities', activityData);
      loadActivities();
      window.dispatchEvent(new CustomEvent('carbonNotification', { detail: { message: 'Activity logged successfully' } }));
    } catch (err) {
      console.error(err);
      window.dispatchEvent(new CustomEvent('carbonNotification', { detail: { message: 'Unable to log activity' } }));
    }
  };

  return (
    <div className="page-grid">
      <section className="page-header">
        <h1>Activity Tracking</h1>
        <p>Log new activities and monitor your carbon reduction progress.</p>
      </section>
      <div className="grid content-grid">
        <ActivityForm onSubmit={handleCreate} />
        <div className="card activity-list">
          <h2>Recent Activities</h2>
          {loading ? (
            <div className="skeleton-list">
              <div className="skeleton-row" />
              <div className="skeleton-row" />
              <div className="skeleton-row" />
            </div>
          ) : activities.length > 0 ? (
            <ul>
              {activities.slice(0, 8).map((item) => (
                <li key={item._id}>
                  <strong>{item.title}</strong>
                  <span>{item.activityType} • {item.carbonEmissionKg} kg CO2e</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-text">No activities logged yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Activities;
