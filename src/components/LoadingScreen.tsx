'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

interface LoadingScreenProps {
  message?: string; // Mensaje opcional para mostrar durante la carga
  minDuration?: number; // Duración mínima en ms que debe mostrarse el loading
  onLoadingComplete?: () => void; // Callback opcional al completar el tiempo de carga
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'Cargando...',
  minDuration = 3500, // Por defecto 3500ms (3.5 segundos)
  onLoadingComplete
}) => {
  const [dots, setDots] = useState('.');
  const [shouldRender, setShouldRender] = useState(true);
  
  // Efecto para animar los puntos suspensivos
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return '.';
        return prev + '.';
      });
    }, 500);
    
    return () => clearInterval(interval);
  }, []);
  
  // Efecto para asegurar que la pantalla de carga se muestre al menos por minDuration ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldRender(false);
      if (onLoadingComplete) {
        onLoadingComplete();
      }
    }, minDuration);
    
    // Limpiar el timer cuando el componente se desmonte
    return () => clearTimeout(timer);
  }, [minDuration, onLoadingComplete]);
  
  // Siempre mostramos el loading porque el control real lo hace el componente padre
  // basado en el callback onLoadingComplete

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <div className="flex flex-col items-center">
        {/* Logo con animación */}
        <div className="relative">
          {/* Círculos animados alrededor del logo */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-secondary opacity-30 blur-lg animate-pulse"></div>
          <div className="absolute -inset-4 rounded-full border-2 border-primary border-opacity-40 animate-spin-slow"></div>
          <div className="relative bg-white rounded-full p-2 shadow-xl">
            <Image
              src="/logo.png"
              alt="Don Mariño Logo"
              width={120}
              height={120}
              className="rounded-full animate-pulse"
            />
          </div>
        </div>
        
        {/* Texto de carga con animación */}
        <div className="mt-8 bg-white px-6 py-3 rounded-full shadow-md text-center">
          <p className="text-gray-700 font-medium text-lg">
            {message}<span className="text-primary">{dots}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
