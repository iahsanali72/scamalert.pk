'use client';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: string[];
}

export default function NotificationModal({ isOpen, onClose, notifications }: NotificationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-xl w-full text-zinc-100 shadow-2xl space-y-4">
        <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
          <h3 className="text-lg font-bold">Automated Notification Logs</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-white text-sm font-bold cursor-pointer">✕</button>
        </div>
        <div className="space-y-2 max-h-64 overflow-y-auto font-mono text-xs">
          {notifications.length === 0 ? (
            <p className="text-zinc-500 py-4 text-center">No automated dispatches logged yet.</p>
          ) : (
            notifications.map((note, idx) => (
              <div key={idx} className="bg-zinc-950 border border-zinc-800 p-3 rounded text-zinc-300">{note}</div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}