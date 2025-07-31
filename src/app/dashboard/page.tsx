'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import RemindersList from '@/components/RemindersList';
import LoadingScreen from '@/components/LoadingScreen';
import { Reminder } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';

export default function Dashboard() {
  const router = useRouter();
  const { user, loading, requireAuth } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [stats, setStats] = useState({
    totalChats: 0,
    totalReminders: 0,
    lastActive: '',
    completionRate: 0
  });

  // Proteger la ruta - redirigir si el usuario no está autenticado
  useEffect(() => {
    requireAuth();
  }, [requireAuth]);

  // Load reminders from localStorage on component mount
  useEffect(() => {
    const savedReminders = localStorage.getItem('reminders');
    if (savedReminders) {
      const parsedReminders = JSON.parse(savedReminders);
      setReminders(parsedReminders);
      
      // Actualizar estadísticas
      const completed = parsedReminders.filter((r: Reminder) => r.completed).length;
      setStats(prev => ({
        ...prev,
        totalReminders: parsedReminders.length,
        completionRate: parsedReminders.length > 0 
          ? Math.round((completed / parsedReminders.length) * 100) 
          : 0
      }));
    }
    
    // Cargar estadísticas de chats
    const chatHistory = localStorage.getItem('chatHistory');
    if (chatHistory) {
      const parsedHistory = JSON.parse(chatHistory);
      setStats(prev => ({
        ...prev,
        totalChats: parsedHistory.length,
        lastActive: parsedHistory.length > 0 
          ? new Date(parsedHistory[parsedHistory.length - 1].timestamp).toLocaleDateString() 
          : 'Nunca'
      }));
    }
  }, []);

  // Function to delete a reminder
  const deleteReminder = (id: string) => {
    setReminders((prev) => {
      const updated = prev.filter((reminder) => reminder.id !== id);
      localStorage.setItem('reminders', JSON.stringify(updated));
      
      // Actualizar estadísticas
      const completed = updated.filter((r) => r.completed).length;
      setStats(prev => ({
        ...prev,
        totalReminders: updated.length,
        completionRate: updated.length > 0 
          ? Math.round((completed / updated.length) * 100) 
          : 0
      }));
      
      return updated;
    });
  };
  
  // Function to toggle reminder completion
  const toggleReminderCompletion = (id: string) => {
    setReminders((prev) => {
      const updated = prev.map(reminder => 
        reminder.id === id 
          ? {...reminder, completed: !reminder.completed}
          : reminder
      );
      
      localStorage.setItem('reminders', JSON.stringify(updated));
      
      // Actualizar estadísticas
      const completed = updated.filter((r) => r.completed).length;
      setStats(prev => ({
        ...prev,
        completionRate: updated.length > 0 
          ? Math.round((completed / updated.length) * 100) 
          : 0
      }));
      
      return updated;
    });
  };

  // Estado para controlar cuando mostrar el loading con duración mínima
  const [showLoading, setShowLoading] = useState(loading);
  
  // Efecto para actualizar el estado de showLoading cuando cambia loading
  useEffect(() => {
    if (loading) {
      setShowLoading(true);
    }
  }, [loading]);
  
  // Mostrar pantalla de carga mientras se verifica la autenticación
  if (showLoading) {
    return <LoadingScreen 
      message="Cargando dashboard" 
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
  
  // Obtener fecha actual formateada
  const currentDate = new Date().toLocaleDateString('es-ES', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">
      <Header />
      
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            ¡Bienvenido, <span className="text-primary">{user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario'}!</span>
          </h1>
          <p className="text-gray-600 mt-2">{currentDate}</p>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-primary-50 text-primary">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Chats totales</p>
                <h3 className="text-xl font-bold">{stats.totalChats}</h3>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-secondary-50 text-secondary">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Recordatorios</p>
                <h3 className="text-xl font-bold">{stats.totalReminders}</h3>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-50 text-green-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Tasa de finalización</p>
                <h3 className="text-xl font-bold">{stats.completionRate}%</h3>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-50 text-blue-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Último activo</p>
                <h3 className="text-xl font-bold">{stats.lastActive}</h3>
              </div>
            </div>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Acciones rápidas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/chat" className="flex flex-col items-center bg-gradient-to-r from-primary to-primary-dark text-white p-5 rounded-xl shadow-sm transform hover:scale-105 transition-transform duration-300">
              <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="font-medium">Iniciar chat</span>
            </Link>
            
            <div onClick={() => router.push('/reminders')} className="flex flex-col items-center bg-gradient-to-r from-secondary to-secondary-dark text-white p-5 rounded-xl shadow-sm cursor-pointer transform hover:scale-105 transition-transform duration-300">
              <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">Ver recordatorios</span>
            </div>
            
            <div onClick={() => router.push('/profile')} className="flex flex-col items-center bg-gradient-to-r from-blue-500 to-blue-600 text-white p-5 rounded-xl shadow-sm cursor-pointer transform hover:scale-105 transition-transform duration-300">
              <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="font-medium">Mi perfil</span>
            </div>
            
            <div className="flex flex-col items-center bg-gradient-to-r from-green-500 to-green-600 text-white p-5 rounded-xl shadow-sm cursor-pointer transform hover:scale-105 transition-transform duration-300">
              <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span className="font-medium">Recursos</span>
            </div>
          </div>
        </div>
        
        {/* Recent Reminders */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Recordatorios recientes</h2>
            <Link href="/reminders" className="text-primary hover:text-primary-dark font-medium text-sm flex items-center">
              Ver todos
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          
          {reminders.length > 0 ? (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
              <ul className="divide-y divide-gray-100">
                {reminders.slice(0, 5).map((reminder) => (
                  <li key={reminder.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={reminder.completed}
                          onChange={() => toggleReminderCompletion(reminder.id)}
                          className="h-5 w-5 text-primary rounded focus:ring-primary cursor-pointer"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium text-gray-900 truncate ${reminder.completed ? 'line-through text-gray-500' : ''}`}>
                          {reminder.title}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {reminder.date}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <button
                          onClick={() => deleteReminder(reminder.id)}
                          className="inline-flex items-center p-1 text-sm font-medium text-gray-400 hover:text-red-600"
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
              <h3 className="text-lg font-medium text-gray-900 mb-1">No tienes recordatorios</h3>
              <p className="text-gray-500 mb-4">Crea recordatorios desde el chat para ayudarte a organizar tus tareas.</p>
              <Link href="/chat" className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors duration-300">
                Ir al chat
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
