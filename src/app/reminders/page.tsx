'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import LoadingScreen from '@/components/LoadingScreen';
import { Reminder } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';

export default function Reminders() {
  const router = useRouter();
  const { user, loading, requireAuth } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
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
  
  // Filter reminders based on filter status and search term
  const filteredReminders = reminders.filter(reminder => {
    const matchesFilter = 
      filterStatus === 'all' ||
      (filterStatus === 'active' && !reminder.completed) ||
      (filterStatus === 'completed' && reminder.completed);
      
    const matchesSearch = 
      searchTerm === '' ||
      reminder.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reminder.content?.toLowerCase().includes(searchTerm.toLowerCase());
      
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
      
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis recordatorios</h1>
          <p className="text-gray-600">Organiza y gestiona tus tareas fácilmente</p>
        </div>
        
        {/* Filters and search */}
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
                Activos
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
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <ul className="divide-y divide-gray-100">
              {filteredReminders.map((reminder) => (
                <li key={reminder.id} className="p-4 hover:bg-gray-50 transition-colors duration-150">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-5 w-5 relative">
                        <input
                          type="checkbox"
                          checked={reminder.completed}
                          onChange={() => toggleCompletion(reminder.id)}
                          className="h-5 w-5 text-primary rounded focus:ring-primary cursor-pointer"
                        />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${reminder.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                        {reminder.title}
                      </p>
                      {reminder.content && (
                        <p className="mt-1 text-sm text-gray-500 line-clamp-1">
                          {reminder.content}
                        </p>
                      )}
                      <div className="mt-1 flex items-center">
                        <span className="text-xs text-gray-500">{reminder.date}</span>
                        {reminder.time && (
                          <span className="ml-2 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                            {reminder.time}
                          </span>
                        )}
                        {reminder.priority && (
                          <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                            reminder.priority === 'high' 
                              ? 'bg-red-50 text-red-700' 
                              : reminder.priority === 'medium'
                              ? 'bg-yellow-50 text-yellow-700'
                              : 'bg-green-50 text-green-700'
                          }`}>
                            {reminder.priority === 'high' ? 'Alta' : reminder.priority === 'medium' ? 'Media' : 'Baja'}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Reminder actions */}
                    <div className="flex-shrink-0 flex items-center space-x-2">
                      <button
                        onClick={() => {
                          // Aquí iría la lógica para editar el recordatorio
                          alert(`Editar: ${reminder.title}`);
                        }}
                        className="p-1 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => deleteReminder(reminder.id)}
                        className="p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
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
  );
}
