import { useState } from 'react';

const activityTypes = [
  { value: 'driving', label: 'Driving' },
  { value: 'flight', label: 'Flight' },
  { value: 'electricity', label: 'Electricity' },
  { value: 'public_transport', label: 'Public Transport' },
  { value: 'cycling', label: 'Cycling' },
  { value: 'walking', label: 'Walking' },
  { value: 'food', label: 'Food' },
  { value: 'other', label: 'Other' },
];

const ActivityForm = ({ onSubmit }) => {
  const [form, setForm] = useState({
    title: '',
    activityType: 'driving',
    amount: '',
    unit: 'km',
    notes: '',
    date: new Date().toISOString().slice(0, 10),
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(form);
  };

  return (
    <form className="card form-card" onSubmit={handleSubmit}>
      <h2>Log New Activity</h2>
      <label>
        Title
        <input name="title" value={form.title} onChange={handleChange} required />
      </label>
      <label>
        Activity Type
        <select name="activityType" value={form.activityType} onChange={handleChange}>
          {activityTypes.map((type) => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
      </label>
      <label>
        Amount
        <input name="amount" type="number" value={form.amount} onChange={handleChange} required />
      </label>
      <label>
        Unit
        <input name="unit" value={form.unit} onChange={handleChange} required />
      </label>
      <label>
        Date
        <input name="date" type="date" value={form.date} onChange={handleChange} required />
      </label>
      <label>
        Notes
        <textarea name="notes" value={form.notes} onChange={handleChange} rows="3" />
      </label>
      <button type="submit">Add Activity</button>
    </form>
  );
};

export default ActivityForm;
