'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import LoadingScreen from '@/components/LoadingScreen';
import ConfirmEmailModal from '@/components/ConfirmEmailModal';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mounted, setMounted] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const { login, loading, error, resendConfirmationEmail } = useAuth();
  
  // Para animaciones después de la hidratación
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await login(email, password);
    
    if (result.success) {
      router.push('/dashboard');
    } else if (result.message?.includes('Email not confirmed')) {
      // Mostrar modal de confirmación de email
      setShowConfirmModal(true);
    }
  };

  // Estado para controlar cuando mostrar el loading con duración mínima
  const [showLoading, setShowLoading] = useState(loading);
  
  // Efecto para actualizar el estado de showLoading cuando cambia loading
  useEffect(() => {
    if (loading) {
      setShowLoading(true);
    }
  }, [loading]);
  
  // Mostrar pantalla de carga durante el proceso de inicio de sesión
  if (showLoading) {
    return <LoadingScreen 
      message="Iniciando sesión" 
      onLoadingComplete={() => {
        // Solo ocultamos el loading si la autenticación ya terminó
        if (!loading) {
          setShowLoading(false);
        }
      }} 
    />;
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-orange-50">
      {showConfirmModal && (
        <ConfirmEmailModal 
          email={email} 
          onClose={() => setShowConfirmModal(false)} 
          onResend={resendConfirmationEmail} 
        />
      )}
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
            ¡Bienvenido de nuevo!
          </h2>
          <p className="mt-3 text-lg text-gray-600">
            Inicia sesión para acceder a tus recordatorios
          </p>
          <p className="mt-2 text-sm text-gray-500">
            ¿No tienes cuenta?{' '}
            <Link
              href="/register"
              className="font-medium text-secondary hover:text-orange-500 transition-colors duration-300"
            >
              Regístrate ahora
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg relative animate-pulse">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 01-1-1v-4a1 1 0 112 0v4a1 1 0 01-1 1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
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
            </div>
            <div className="relative">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder-gray-400 text-gray-900 transition-all duration-300 hover:border-primary/50 focus:outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-5 w-5 text-secondary focus:ring-secondary border-gray-300 rounded transition-all duration-300"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-700 hover:text-gray-900 transition-colors duration-300"
              >
                Recordarme
              </label>
            </div>

            <div className="text-sm">
              <Link
                href="/forgot-password"
                className="font-medium text-secondary hover:text-orange-500 transition-colors duration-300 flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                ¿Olvidaste tu contraseña?
              </Link>
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                )}
              </span>
              <span className="ml-4">{loading ? 'Iniciando sesión...' : 'Iniciar sesión'}</span>
            </button>
          </div>
          
          <div className="mt-8 border-t border-gray-200 pt-6 flex justify-center">
            <Link
              href="/"
              className="flex items-center font-medium text-sm text-gray-600 hover:text-primary transition-colors duration-300"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver a la página de inicio
            </Link>
          </div>
          
          <div className="mt-6 text-center text-xs text-gray-400">
            Al iniciar sesión, aceptas nuestros 
            <Link href="/terms" className="text-secondary hover:text-orange-500 transition-colors duration-300">términos y condiciones</Link>
            {' '}y nuestra{' '}
            <Link href="/privacy" className="text-secondary hover:text-orange-500 transition-colors duration-300">política de privacidad</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
