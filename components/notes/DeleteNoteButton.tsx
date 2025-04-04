'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';

interface DeleteNoteButtonProps {
  onDelete: () => Promise<void>;
}

export default function DeleteNoteButton({ onDelete }: DeleteNoteButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowConfirm(true);
  };

  const handleConfirm = async (e: React.MouseEvent) => {
    e.preventDefault();
    await onDelete();
    setShowConfirm(false);
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowConfirm(false);
  };

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={handleConfirm}
          className="text-xs text-red-500 hover:text-red-600"
        >
          Delete?
        </button>
        <button
          onClick={handleCancel}
          className="text-xs text-gray-400 hover:text-gray-300"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleClick}
      className="hover:text-red-500 transition-colors p-1"
    >
      <Trash2 className="h-5 w-5" />
    </button>
  );
} 