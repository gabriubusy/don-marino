'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
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
    <main className="flex flex-col h-screen">
      <Header />
      
      <div className="flex-1 overflow-hidden mt-16">
        <ChatContainer addReminder={addReminder} />
      </div>
    </main>
  );
}
