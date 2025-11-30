/**
 * Modal dialog component for displaying overlay content.
 * @module components/ui/Modal
 */

import React from 'react';
import { X } from 'lucide-react';

/**
 * Modal component props.
 */
interface ModalProps {
  /** Whether the modal is visible */
  isOpen: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Modal title displayed in header */
  title: string;
  /** Modal content */
  children: React.ReactNode;
}

/**
 * A modal dialog component with backdrop, header, and scrollable content area.
 * Clicking outside the modal or the close button will trigger onClose.
 * 
 * @param props.isOpen - Controls modal visibility
 * @param props.onClose - Called when user clicks backdrop or close button
 * @param props.title - Title shown in modal header
 * @param props.children - Content to render inside the modal
 * 
 * @example
 * <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Settings">
 *   <p>Modal content here</p>
 * </Modal>
 */
export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" 
      onClick={onClose}
    >
      <div 
        className="bg-[hsl(var(--surface-1))] border border-[hsl(var(--surface-2))] rounded-xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col" 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--surface-2))]">
          <h3 className="text-lg font-bold text-[hsl(var(--text-main))]">{title}</h3>
          <button 
            onClick={onClose} 
            className="p-1 hover:bg-[hsl(var(--surface-2))] rounded text-[hsl(var(--text-dim))] hover:text-[hsl(var(--text-main))]"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};
