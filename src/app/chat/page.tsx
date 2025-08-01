'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import ChatContainer from '@/components/ChatContainer';
import LoadingScreen from '@/components/LoadingScreen';
import { Reminder } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';

export default function Chat() {
  const router = useRouter();
  const { user, loading, requireAuth } = useAuth();
  
  // Función para añadir recordatorios (pasará al componente ChatContainer)
  const addReminder = (reminder: Reminder) => {
    // Recuperar recordatorios existentes
    const savedReminders = localStorage.getItem('reminders');
    let currentReminders = savedReminders ? JSON.parse(savedReminders) : [];
    
    // Añadir nuevo recordatorio
    currentReminders = [...currentReminders, reminder];
    
    // Guardar en localStorage
    localStorage.setItem('reminders', JSON.stringify(currentReminders));

    // Registrar actividad en el chat
    const timestamp = Date.now();
    const chatHistory = localStorage.getItem('chatHistory') || '[]';
    const parsedHistory = JSON.parse(chatHistory);
    parsedHistory.push({ type: 'reminder_created', timestamp });
    localStorage.setItem('chatHistory', JSON.stringify(parsedHistory));
  };

  // Proteger la ruta - redirigir si el usuario no está autenticado
  useEffect(() => {
    requireAuth();
  }, [requireAuth]);
  
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
      message="Cargando chat" 
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Chat con Don Mariño</h1>
          <p className="text-gray-600">Tu asistente personal para recordatorios y gestión de tareas</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar de navegación */}
          <div className="lg:col-span-1">
            <Navigation />
            
            <div className="mt-6 bg-white shadow-sm rounded-lg border border-gray-100 p-5">
              <h3 className="font-medium text-gray-900 mb-3">Sugerencias rápidas</h3>
              <div className="space-y-2">
                <button 
                  onClick={() => {
                    const chatInput = document.querySelector('input[type="text"]') as HTMLInputElement;
                    if (chatInput) {
                      chatInput.value = "Recuérdame llamar al médico mañana a las 10";
                      chatInput.focus();
                    }
                  }}
                  className="w-full text-left p-2 bg-blue-50 text-primary text-sm rounded hover:bg-blue-100"
                >
                  Recuérdame llamar al médico mañana a las 10
                </button>
                <button 
                  onClick={() => {
                    const chatInput = document.querySelector('input[type="text"]') as HTMLInputElement;
                    if (chatInput) {
                      chatInput.value = "Lista mis recordatorios pendientes";
                      chatInput.focus();
                    }
                  }}
                  className="w-full text-left p-2 bg-blue-50 text-primary text-sm rounded hover:bg-blue-100"
                >
                  Lista mis recordatorios pendientes
                </button>
                <button 
                  onClick={() => {
                    const chatInput = document.querySelector('input[type="text"]') as HTMLInputElement;
                    if (chatInput) {
                      chatInput.value = "¿Cómo puedes ayudarme?";
                      chatInput.focus();
                    }
                  }}
                  className="w-full text-left p-2 bg-blue-50 text-primary text-sm rounded hover:bg-blue-100"
                >
                  ¿Cómo puedes ayudarme?
                </button>
              </div>
            </div>
          </div>
          
          {/* Área principal de chat */}
          <div className="lg:col-span-3 h-[75vh] flex flex-col bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <ChatContainer addReminder={addReminder} />
          </div>
        </div>
      </div>
    </div>
  );
}
