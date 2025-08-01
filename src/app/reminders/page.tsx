'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import LoadingScreen from '@/components/LoadingScreen';
import RemindersList from '@/components/RemindersList';
import { Database } from '@/lib/database.types';
import { Reminder as FrontendReminder } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';

// Base de datos Reminder type
type DbReminder = Database['public']['Tables']['Reminder']['Row'];

// Función para adaptar entre los tipos de recordatorios
const adaptToDbReminder = (reminder: FrontendReminder): DbReminder => {
  // Convertir priority de string a número
  let priorityNum = 1;
  if (reminder.priority === 'medium') priorityNum = 2;
  if (reminder.priority === 'high') priorityNum = 3;
  
  return {
    id: reminder.id,
    title: reminder.title,
    description: reminder.description || null,
    user_id: 'local', // Valor por defecto para recordatorios locales
    priority: priorityNum,
    due_date: reminder.date,
    recurrence: null,
    group_id: null
  };
};

// Función para adaptar de la BD al frontend
const adaptToFrontendReminder = (reminder: DbReminder): FrontendReminder => {
  // Convertir priority de número a string
  let priorityStr: 'high' | 'medium' | 'low' = 'low';
  if (reminder.priority === 2) priorityStr = 'medium';
  if (reminder.priority === 3) priorityStr = 'high';
  
  return {
    id: reminder.id,
    title: reminder.title,
    description: reminder.description || undefined,
    date: reminder.due_date,
    completed: false, // Por defecto, los recordatorios no están completados
    createdAt: Date.now(),
    priority: priorityStr
  };
};

export default function Reminders() {
  const router = useRouter();
  const { user, loading, requireAuth } = useAuth();
  const [reminders, setReminders] = useState<FrontendReminder[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Proteger la ruta - redirigir si el usuario no está autenticado
  useEffect(() => {
    requireAuth();
  }, [requireAuth]);

  // Load reminders from localStorage on component mount
  useEffect(() => {
    const savedReminders = localStorage.getItem('reminders');
    if (savedReminders) {
      setReminders(JSON.parse(savedReminders));
    }
  }, []);

  // Estado para controlar cuando mostrar el loading con duración mínima
  const [showLoading, setShowLoading] = useState(loading);
  
  // Efecto para actualizar el estado de showLoading cuando cambia loading
  useEffect(() => {
    if (loading) {
      setShowLoading(true);
    }
  }, [loading]);
  
  // Function to delete a reminder
  const deleteReminder = (id: string) => {
    setReminders((prev) => {
      const updated = prev.filter((reminder) => reminder.id !== id);
      localStorage.setItem('reminders', JSON.stringify(updated));
      return updated;
    });
  };
  
  // Function to toggle reminder completion
  const toggleCompletion = (id: string) => {
    setReminders((prev) => {
      const updated = prev.map(reminder => 
        reminder.id === id 
          ? {...reminder, completed: !reminder.completed}
          : reminder
      );
      
      localStorage.setItem('reminders', JSON.stringify(updated));
      return updated;
    });
  };
  
  // Function to update a reminder
  const updateReminder = (updatedReminder: DbReminder) => {
    // Convertir el recordatorio de la base de datos al formato del frontend
    const frontendReminder = adaptToFrontendReminder(updatedReminder);
    
    // Preservar el estado de completado del recordatorio original
    const originalReminder = reminders.find(r => r.id === updatedReminder.id);
    if (originalReminder) {
      frontendReminder.completed = originalReminder.completed;
    }
    
    setReminders((prev) => {
      const updated = prev.map(reminder => 
        reminder.id === frontendReminder.id ? frontendReminder : reminder
      );
      
      localStorage.setItem('reminders', JSON.stringify(updated));
      return updated;
    });
  };
  
  // Filter reminders based on filter status and search term
  const filteredReminders = reminders.filter(reminder => {
    const matchesFilter = 
      filterStatus === 'all' ||
      (filterStatus === 'active' && !reminder.completed) ||
      (filterStatus === 'completed' && reminder.completed);
      
    const matchesSearch = 
      searchTerm === '' ||
      reminder.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reminder?.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
    return matchesFilter && matchesSearch;
  });
  
  // Mostrar pantalla de carga mientras se verifica la autenticación
  if (showLoading) {
    return <LoadingScreen 
      message="Cargando recordatorios" 
      onLoadingComplete={() => {
        // Solo ocultamos el loading si la autenticación ya terminó
        if (!loading) {
          setShowLoading(false);
        }
      }} 
    />;
  }

  // Si el usuario no está autenticado, requireAuth() se encargará de redirigir
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">
      <Header />
      
      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis recordatorios</h1>
          <p className="text-gray-600">Organiza y gestiona tus tareas fácilmente</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar de navegación */}
          <div className="lg:col-span-1">
            <Navigation />
            
            <div className="mt-6 bg-white shadow-sm rounded-lg border border-gray-100 p-5">
              <h3 className="font-medium text-gray-900 mb-3">Resumen</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-medium">{reminders.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pendientes:</span>
                  <span className="font-medium">{reminders.filter(r => !r.completed).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Completados:</span>
                  <span className="font-medium">{reminders.filter(r => r.completed).length}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-3">
            <div className="bg-white p-5 rounded-xl shadow-sm mb-6 border border-gray-100">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => setFilterStatus('all')}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      filterStatus === 'all'
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Todos
                  </button>
                  <button 
                    onClick={() => setFilterStatus('active')}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      filterStatus === 'active'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Pendientes
                  </button>
                  <button 
                    onClick={() => setFilterStatus('completed')}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      filterStatus === 'completed'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Completados
                  </button>
                </div>
                
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar recordatorios..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full md:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
        
        {/* Reminders list */}
            {filteredReminders.length > 0 ? (
              <RemindersList 
                reminders={filteredReminders.map(adaptToDbReminder)} 
                deleteReminder={deleteReminder} 
                updateReminder={updateReminder}
              />
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-100">
                <div className="inline-flex items-center justify-center p-4 bg-blue-50 text-primary rounded-full mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  {searchTerm 
                    ? 'No se encontraron recordatorios con tu búsqueda' 
                    : filterStatus !== 'all' 
                      ? `No tienes recordatorios ${filterStatus === 'active' ? 'activos' : 'completados'}` 
                      : 'No tienes recordatorios'}
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm 
                    ? 'Intenta con otra búsqueda o modifica los filtros' 
                    : 'Crea recordatorios desde el chat para ayudarte a organizar tus tareas'}
                </p>
                <button
                  onClick={() => router.push('/chat')}
                  className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors duration-300"
                >
                  Ir al chat
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
