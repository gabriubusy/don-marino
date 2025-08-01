'use client';

import React, { useEffect, useState } from 'react';
import { getLocalReminders, updateLocalReminder, deleteLocalReminder, ReminderItem } from '@/lib/localStorage';
import RemindersList from './RemindersList';
import { Database } from '@/lib/database.types';

// Convertir un ReminderItem de localStorage al formato que espera RemindersList
const convertToSupabaseFormat = (reminderItem: ReminderItem): Database['public']['Tables']['Reminder']['Row'] => {
  return {
    id: reminderItem.id,
    title: reminderItem.title,
    description: reminderItem.description || '',
    due_date: reminderItem.date,
    priority: reminderItem.priority,
    user_id: 'local', // Marcamos estos recordatorios como locales
    recurrence: null,
    group_id: null
  };
};

const LocalRemindersContainer: React.FC = () => {
  const [reminders, setReminders] = useState<Database['public']['Tables']['Reminder']['Row'][]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar recordatorios del localStorage
  useEffect(() => {
    const loadReminders = () => {
      try {
        const localReminders = getLocalReminders();
        const formattedReminders = localReminders.map(convertToSupabaseFormat);
        setReminders(formattedReminders);
      } catch (error) {
        console.error('Error al cargar recordatorios:', error);
      } finally {
        setLoading(false);
      }
    };

    loadReminders();

    // Escuchar cambios en localStorage (de otras pestañas)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'don_marino_reminders') {
        loadReminders();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Eliminar un recordatorio
  const handleDeleteReminder = (id: string) => {
    if (deleteLocalReminder(id)) {
      setReminders(prevReminders => prevReminders.filter(r => r.id !== id));
    }
  };

  // Actualizar un recordatorio
  const handleUpdateReminder = (updatedReminder: Database['public']['Tables']['Reminder']['Row']) => {
    const localUpdated = updateLocalReminder(updatedReminder.id, {
      title: updatedReminder.title,
      description: updatedReminder.description || '',
      date: updatedReminder.due_date,
      priority: updatedReminder.priority,
      status: 'pending', // Valor por defecto ya que no existe en el tipo Reminder
      created_at: new Date().toISOString() // Fecha actual como valor por defecto
    });

    if (localUpdated) {
      setReminders(prevReminders => 
        prevReminders.map(r => r.id === updatedReminder.id ? updatedReminder : r)
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <RemindersList
      reminders={reminders}
      deleteReminder={handleDeleteReminder}
      updateReminder={handleUpdateReminder}
    />
  );
};

export default LocalRemindersContainer;
