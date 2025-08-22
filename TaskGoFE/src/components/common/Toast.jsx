import { useState, useEffect, useRef } from 'react';
import { FaCheck, FaTimes, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';

const Toast = ({ 
  message, 
  type = 'success', 
  duration = 3000, 
  onClose,
  isVisible = false 
}) => {
  const [show, setShow] = useState(isVisible);
  const [progress, setProgress] = useState(100);
  const startTimeRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    setShow(isVisible);
  }, [isVisible]);

  useEffect(() => {
    if (!show || duration <= 0) return;

    startTimeRef.current = performance.now();

    const tick = (now) => {
      const elapsed = now - startTimeRef.current;
      const ratio = Math.min(elapsed / duration, 1);
      setProgress(100 - ratio * 100);

      if (ratio < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setShow(false);
        setTimeout(() => {
          onClose && onClose();
        }, 300);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [show, duration, onClose]);

  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: FaCheck,
          accent: 'bg-green-500',
          iconBg: 'bg-green-100',
          iconText: 'text-green-700'
        };
      case 'error':
        return {
          icon: FaTimes,
          accent: 'bg-red-500',
          iconBg: 'bg-red-100',
          iconText: 'text-red-700'
        };
      case 'warning':
        return {
          icon: FaExclamationTriangle,
          accent: 'bg-yellow-500',
          iconBg: 'bg-yellow-100',
          iconText: 'text-yellow-700'
        };
      case 'info':
        return {
          icon: FaInfoCircle,
          accent: 'bg-blue-500',
          iconBg: 'bg-blue-100',
          iconText: 'text-blue-700'
        };
      default:
        return {
          icon: FaInfoCircle,
          accent: 'bg-slate-500',
          iconBg: 'bg-slate-100',
          iconText: 'text-slate-700'
        };
    }
  };

  const config = getToastConfig();
  const Icon = config.icon;

  if (!show) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`
        relative w-[22rem] max-w-sm
        bg-white/90 dark:bg-slate-900/90 backdrop-blur-md
        border border-slate-200/60 dark:border-slate-700/60
        rounded-xl shadow-xl ring-1 ring-black/5
        transform transition-all duration-300 ease-in-out
        ${show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        px-4 py-3 pr-3
      `}
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${config.accent}`} />
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 p-2 rounded-full ${config.iconBg} ${config.iconText} shadow-inner`}> 
          <Icon className="text-base" />
        </div>
        <p className="text-sm font-medium text-slate-800 dark:text-slate-100 flex-1">{message}</p>
        <button
          aria-label="Close notification"
          onClick={() => {
            setShow(false);
            setTimeout(() => {
              onClose && onClose();
            }, 300);
          }}
          className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors ml-1"
        >
          <FaTimes className="text-sm" />
        </button>
      </div>
      {duration > 0 && (
        <div className="absolute left-0 right-0 bottom-0 h-1 bg-slate-200/60 dark:bg-slate-700/60 rounded-b-xl overflow-hidden">
          <div
            className={`${config.accent} h-full transition-[width] duration-75`}
            style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
          />
        </div>
      )}
    </div>
  );
};

// Toast container for managing multiple toasts
export const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          isVisible={true}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

// Hook for managing toasts
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success', duration = 3000) => {
    const id = Date.now() + Math.random();
    const newToast = { id, message, type, duration };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto remove after duration
    setTimeout(() => {
      removeToast(id);
    }, duration + 300);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const showSuccess = (message, duration) => addToast(message, 'success', duration);
  const showError = (message, duration) => addToast(message, 'error', duration);
  const showWarning = (message, duration) => addToast(message, 'warning', duration);
  const showInfo = (message, duration) => addToast(message, 'info', duration);

  return {
    toasts,
    addToast,
    removeToast,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};

export default Toast; 