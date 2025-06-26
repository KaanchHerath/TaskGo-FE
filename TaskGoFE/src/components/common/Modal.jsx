import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes } from 'react-icons/fa';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  subtitle,
  icon: Icon,
  iconColor = 'text-blue-600',
  iconBgColor = 'bg-blue-100',
  children,
  maxWidth = 'max-w-md',
  maxHeight = 'max-h-[90vh]',
  showCloseButton = true,
  closeOnOverlayClick = true
}) => {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '0px'; // Prevent layout shift
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  const modalContent = (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
      onClick={handleOverlayClick}
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        minWidth: '100vw'
      }}
    >
      <div 
        className={`bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl w-full ${maxWidth} ${maxHeight} overflow-y-auto border border-white/20`}
        style={{ 
          position: 'relative',
          maxWidth: maxWidth === 'max-w-md' ? '448px' : maxWidth === 'max-w-lg' ? '512px' : '448px',
          transform: 'translate3d(0, 0, 0)', // Force hardware acceleration
          margin: 'auto',
          maxHeight: '90vh'
        }}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200/60">
          <div className="flex items-center space-x-3">
            {Icon && (
              <div className={`w-10 h-10 ${iconBgColor} rounded-full flex items-center justify-center`}>
                <Icon className={iconColor} />
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
              {subtitle && <p className="text-sm text-slate-600">{subtitle}</p>}
            </div>
          </div>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100/80 rounded-full transition-colors"
            >
              <FaTimes className="text-gray-600" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );

  // Use portal to render modal at document body level
  return createPortal(modalContent, document.body);
};

export default Modal; 