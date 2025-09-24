import { useEffect, useState } from 'react';

export default function Flash({ message, type = 'success', duration = 3500 }) {
  const [open, setOpen] = useState(!!message);
  useEffect(() => {
    setOpen(!!message);
    if (message) {
      const t = setTimeout(() => setOpen(false), duration);
      return () => clearTimeout(t);
    }
  }, [message, duration]);

  if (!open || !message) return null;

  const base = 'alert shadow flex items-center';
  const color = type === 'error' ? 'alert-error' : type === 'warning' ? 'alert-warning' : 'alert-success';

  return (
    <div className={`${base} ${color}`}>
      <span>{message}</span>
      <button className="btn btn-ghost btn-xs ml-auto" onClick={() => setOpen(false)}>Tutup</button>
    </div>
  );
}

