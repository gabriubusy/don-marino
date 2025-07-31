'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import LoadingScreen from '@/components/LoadingScreen';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [mounted, setMounted] = useState(false);
  const { resetPassword, loading } = useAuth();
  
  // Para animaciones después de la hidratación
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    
    // Usar el hook de autenticación para enviar el correo de recuperación
    const result = await resetPassword(email);
    
    setMessage({
      type: result.success ? 'success' : 'error',
      text: result.message
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
  
  // Mostrar pantalla de carga durante el proceso de recuperación
  if (showLoading) {
    return <LoadingScreen 
      message="Enviando enlace de recuperación" 
      onLoadingComplete={() => {
        // Solo ocultamos el loading si el proceso ya terminó
        if (!loading) {
          setShowLoading(false);
        }
      }} 
    />;
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <div className={`max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-2xl transform transition-all duration-500 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
        <div className="text-center">
          <div className="flex justify-center">
            <Link href="/" className="relative inline-block group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-full opacity-30 group-hover:opacity-100 blur transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white rounded-full p-1">
                <Image
                  src="/logo.png"
                  alt="Don Mariño Logo"
                  width={120}
                  height={120}
                  className="rounded-full transform transition duration-500 group-hover:scale-105"
                />
              </div>
            </Link>
          </div>
          <h2 className="mt-6 text-4xl font-extrabold text-primary">
            ¿Olvidaste tu contraseña?
          </h2>
          <p className="mt-3 text-lg text-gray-600">
            No te preocupes, te enviaremos un enlace para restablecerla
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Ingresa tu correo electrónico asociado a tu cuenta
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
          {message && (
            <div className={`${
              message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
            } px-4 py-3 rounded-lg relative border animate-pulse flex items-center`}>
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                {message.type === 'success' ? (
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                ) : (
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 01-1-1v-4a1 1 0 112 0v4a1 1 0 01-1 1z" clipRule="evenodd" />
                )}
              </svg>
              {message.text}
            </div>
          )}
          
          <div className="space-y-4">
            <div className="relative">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Correo electrónico
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder-gray-400 text-gray-900 transition-all duration-300 hover:border-primary/50 focus:outline-none"
                  placeholder="tucorreo@ejemplo.com"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Enviaremos un enlace de recuperación a esta dirección</p>
            </div>
          </div>

          <div className="mt-6">
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-primary to-primary hover:from-primary hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                {loading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-white group-hover:text-gray-50" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                )}
              </span>
              <span className="ml-4">{loading ? 'Enviando enlace...' : 'Enviar enlace de recuperación'}</span>
            </button>
          </div>
          
          <div className="mt-8 border-t border-gray-200 pt-6 flex justify-center">
            <Link
              href="/login"
              className="flex items-center font-medium text-sm text-gray-600 hover:text-primary transition-colors duration-300"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
              </svg>
              Volver a iniciar sesión
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
