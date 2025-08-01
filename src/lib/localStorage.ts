// localStorage.ts
// Utilidades para gestionar recordatorios en localStorage

export interface ReminderItem {
  id: string;
  title: string;
  description: string;
  date: string;   // Equivalente a due_date en la base de datos
  priority: number;
  status: 'pending' | 'completed' | 'canceled';  // Campo local que no existe en la base de datos
  created_at: string;  // Campo local que no existe en la base de datos
}

const REMINDERS_KEY = 'don_marino_reminders';

// Obtener todos los recordatorios del localStorage
export function getLocalReminders(): ReminderItem[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const remindersJson = localStorage.getItem(REMINDERS_KEY);
    if (!remindersJson) return [];
    
    return JSON.parse(remindersJson);
  } catch (error) {
    console.error('Error al leer recordatorios de localStorage:', error);
    return [];
  }
}

// Guardar un nuevo recordatorio en localStorage
export function saveLocalReminder(reminder: Omit<ReminderItem, 'id'>): ReminderItem {
  if (typeof window === 'undefined') {
    throw new Error('No se puede acceder a localStorage en un entorno sin navegador');
  }
  
  try {
    const existingReminders = getLocalReminders();
    
    // Generar un ID único basado en timestamp
    const newReminder: ReminderItem = {
      ...reminder,
      id: `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    };
    
    // Añadir el nuevo recordatorio a la lista
    const updatedReminders = [...existingReminders, newReminder];
    
    // Guardar la lista actualizada
    localStorage.setItem(REMINDERS_KEY, JSON.stringify(updatedReminders));
    
    return newReminder;
  } catch (error) {
    console.error('Error al guardar recordatorio en localStorage:', error);
    throw error;
  }
}

// Actualizar un recordatorio existente
export function updateLocalReminder(id: string, updates: Partial<ReminderItem>): ReminderItem | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const reminders = getLocalReminders();
    const reminderIndex = reminders.findIndex(r => r.id === id);
    
    if (reminderIndex === -1) return null;
    
    // Actualizar el recordatorio
    const updatedReminder = { 
      ...reminders[reminderIndex],
      ...updates
    };
    
    reminders[reminderIndex] = updatedReminder;
    
    // Guardar la lista actualizada
    localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
    
    return updatedReminder;
  } catch (error) {
    console.error('Error al actualizar recordatorio en localStorage:', error);
    return null;
  }
}

// Eliminar un recordatorio
export function deleteLocalReminder(id: string): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const reminders = getLocalReminders();
    const updatedReminders = reminders.filter(r => r.id !== id);
    
    // Si no se eliminó ningún recordatorio
    if (updatedReminders.length === reminders.length) return false;
    
    // Guardar la lista actualizada
    localStorage.setItem(REMINDERS_KEY, JSON.stringify(updatedReminders));
    
    return true;
  } catch (error) {
    console.error('Error al eliminar recordatorio de localStorage:', error);
    return false;
  }
}
