'use client'

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';

type CommonDialogProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export const CommonDialog = ({
  open,
  onClose,
  children,
}: CommonDialogProps) => {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          {/* Backdrop */}
          <motion.button
            type="button"
            aria-label="닫기"
            onClick={onClose}
            className="absolute inset-0 bg-black/50 z-[100] pointer-events-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />

          {/* Dialog */}
          <motion.div
            role="dialog"
            aria-modal="true"
            className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-xl z-[101] pointer-events-auto"
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

