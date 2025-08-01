'use client';

import React, { useState } from 'react';
import { Database } from '@/lib/database.types';
import EditReminderModal from './EditReminderModal';
import DeleteReminderModal from './DeleteReminderModal';

type Reminder = Database['public']['Tables']['Reminder']['Row'];

interface RemindersListProps {
  reminders: Reminder[];
  deleteReminder: (id: string) => void;
  updateReminder?: (updatedReminder: Reminder) => void;
}

const RemindersList: React.FC<RemindersListProps> = ({ reminders, deleteReminder, updateReminder }) => {
  const [selectedPriority, setSelectedPriority] = useState<number | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null);
  
  // Filter reminders by priority if selected
  const filteredReminders = selectedPriority !== null 
    ? reminders.filter(reminder => reminder.priority === selectedPriority)
    : reminders;
    
  // Sort reminders by due date (closest first)
  const sortedReminders = [...filteredReminders].sort((a, b) => 
    new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
  );

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-primary mb-2">Mis Recordatorios</h2>
        
        {/* Priority filter */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-gray-600">Filtrar por prioridad:</span>
          <div className="flex gap-1">
            {[1, 2, 3].map((priority) => (
              <button
                key={priority}
                className={`px-3 py-1 rounded-md text-sm ${
                  selectedPriority === priority
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
                onClick={() => 
                  selectedPriority === priority 
                    ? setSelectedPriority(null) 
                    : setSelectedPriority(priority)
                }
              >
                {priority === 1 && 'Baja'}
                {priority === 2 && 'Media'}
                {priority === 3 && 'Alta'}
              </button>
            ))}
            {selectedPriority !== null && (
              <button
                className="px-3 py-1 rounded-md text-sm bg-gray-100 text-gray-700"
                onClick={() => setSelectedPriority(null)}
              >
                Limpiar
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Reminders list */}
      <div className="flex-1 overflow-y-auto p-4">
        {sortedReminders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No tienes recordatorios{selectedPriority !== null ? ' con esta prioridad' : ''}.
          </div>
        ) : (
          <div className="space-y-4">
            {sortedReminders.map((reminder) => (
              <div
                key={reminder.id}
                className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-lg">{reminder.title}</h3>
                  <span 
                    className={`px-2 py-1 rounded-md text-xs ${
                      reminder.priority === 3
                        ? 'bg-red-100 text-red-800'
                        : reminder.priority === 2
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {reminder.priority === 3 && 'Alta'}
                    {reminder.priority === 2 && 'Media'}
                    {reminder.priority === 1 && 'Baja'}
                  </span>
                </div>
                
                {reminder.description && (
                  <p className="text-gray-600 mb-3">{reminder.description}</p>
                )}
                
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    <span>Fecha: </span>
                    <span className="font-medium">
                      {new Date(reminder.due_date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                    
                    {reminder.recurrence && (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                        {reminder.recurrence}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedReminder(reminder);
                        setEditModalOpen(true);
                      }}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => {
                        setSelectedReminder(reminder);
                        setDeleteModalOpen(true);
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Edit Modal */}
      <EditReminderModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        reminder={selectedReminder}
        onSave={(updatedReminder) => {
          if (updateReminder) {
            updateReminder(updatedReminder);
          }
        }}
      />
      
      {/* Delete Confirmation Modal */}
      <DeleteReminderModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        reminder={selectedReminder}
        onDelete={deleteReminder}
      />
    </div>
  );
};

export default RemindersList;
