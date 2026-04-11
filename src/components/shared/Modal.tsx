import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = 'md'
}: ModalProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl'
  };
  return (
    <AnimatePresence>
      {isOpen &&
      <>
          {/* Backdrop */}
          <motion.div
          initial={{
            opacity: 0
          }}
          animate={{
            opacity: 1
          }}
          exit={{
            opacity: 0
          }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
        

          {/* Modal Container */}
          <div className="fixed inset-0 overflow-y-auto z-50 pointer-events-none flex items-center justify-center p-4">
            <motion.div
            initial={{
              opacity: 0,
              scale: 0.95,
              y: 20
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0
            }}
            exit={{
              opacity: 0,
              scale: 0.95,
              y: 20
            }}
            transition={{
              type: 'spring',
              duration: 0.3,
              bounce: 0
            }}
            className={`w-full ${maxWidthClasses[maxWidth]} bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl shadow-xl pointer-events-auto flex flex-col max-h-[90vh]`}>
            
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)] shrink-0">
                <h3 className="text-lg font-heading font-semibold text-[var(--text-primary)]">
                  {title}
                </h3>
                <button
                onClick={onClose}
                className="p-1 rounded-md text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-colors">
                
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="p-4 overflow-y-auto">{children}</div>

              {/* Footer */}
              {footer &&
            <div className="p-4 border-t border-[var(--border-color)] bg-[var(--bg-secondary)] rounded-b-xl shrink-0 flex justify-end gap-3">
                  {footer}
                </div>
            }
            </motion.div>
          </div>
        </>
      }
    </AnimatePresence>);

}