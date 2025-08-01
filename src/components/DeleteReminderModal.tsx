'use client';

import React from 'react';
import { Database } from '@/lib/database.types';

type Reminder = Database['public']['Tables']['Reminder']['Row'];

interface DeleteReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  reminder: Reminder | null;
  onDelete: (id: string) => void;
}

const DeleteReminderModal: React.FC<DeleteReminderModalProps> = ({
  isOpen,
  onClose,
  reminder,
  onDelete
}) => {
  if (!isOpen || !reminder) return null;
  
  const handleDelete = () => {
    onDelete(reminder.id);
    onClose();
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Eliminar Recordatorio</h3>
        </div>
        
        <div className="px-6 py-4">
          <p className="text-gray-700 mb-2">
            ¿Estás seguro de que deseas eliminar este recordatorio?
          </p>
          <p className="font-medium text-gray-900">"{reminder.title}"</p>
          
          {reminder.description && (
            <p className="text-gray-600 mt-1 text-sm">
              {reminder.description}
            </p>
          )}
          
          <p className="text-gray-500 mt-3 text-sm">
            Esta acción no se puede deshacer.
          </p>
        </div>
        
        <div className="px-6 py-3 bg-gray-50 text-right space-x-3 rounded-b-lg">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteReminderModal;
