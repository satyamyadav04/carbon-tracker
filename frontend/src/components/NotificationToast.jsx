import { useEffect, useState } from 'react';

const NotificationToast = () => {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const listener = (event) => {
      if (event.detail?.message) {
        setToast({ message: event.detail.message, variant: event.detail.variant || 'info' });
      }
    };

    window.addEventListener('carbonNotification', listener);
    return () => window.removeEventListener('carbonNotification', listener);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  if (!toast) return null;

  return <div className={`toast toast-${toast.variant}`}>{toast.message}</div>;
};

export default NotificationToast;
