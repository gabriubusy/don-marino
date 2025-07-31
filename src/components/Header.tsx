import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

const Header: React.FC = () => {
  // Estados para controlar las animaciones
  const [mounted, setMounted] = useState(false);
  const [typingComplete, setTypingComplete] = useState(false);
  const [typedText, setTypedText] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const fullText = 'Recordatorios Inteligentes';
  const typingSpeed = 100; // ms por caracter
  
  // Utilizar el hook de autenticación
  const { user, loading, logout } = useAuth();
  
  // Efecto para activar animaciones al montar
  useEffect(() => {
    setMounted(true);
    
    // Efecto de máquina de escribir
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex < fullText.length) {
        setTypedText(fullText.substring(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
        setTypingComplete(true);
      }
    }, typingSpeed);
    
    return () => clearInterval(typingInterval);
  }, []);
  
  // Extraer nombre del usuario
  const getUserName = () => {
    if (!user) return '';
    // Intentamos obtener el nombre desde metadata
    if (user.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    // Si no existe, usamos el email hasta el @
    return user.email?.split('@')[0] || '';
  };
  
  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
  };
  
  return (
    <header className={`bg-white shadow-md sticky top-0 z-10 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo y nombre */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <div className="relative group mr-3">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-secondary to-primary rounded-full opacity-0 group-hover:opacity-70 blur-sm transition duration-300"></div>
                <div className="relative w-10 h-10 bg-white rounded-full flex items-center justify-center overflow-hidden border-2 border-primary">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-white animate-spin-slow opacity-70"></div>
                  <div className="text-primary font-bold text-sm relative">DM</div>
                </div>
              </div>
              
              <div className="flex flex-col">
                <h1 className={`text-xl font-bold text-primary tracking-tight transition-all duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
                  Don Mariño
                </h1>
                <div className="flex items-center -mt-1">
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-orange-100 text-secondary">
                    <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse mr-1"></span>
                    <span className="font-medium">Activo</span>
                  </span>
                  <span className="ml-2 text-[10px] text-gray-500 font-medium tracking-wider relative">
                    <span className="inline-flex items-center">
                      <span className="font-mono">{typedText}</span>
                      <span className={`inline-block w-1 h-3 bg-secondary ml-0.5 ${typingComplete ? 'animate-pulse' : 'animate-bounce-slow'}`}></span>
                    </span>
                  </span>
                </div>
              </div>
            </Link>
          </div>
          
          {/* Enlaces y botones */}
          <div className="flex items-center space-x-3">
            {!loading && (
              <>
                {user ? (
                  // Usuario autenticado - Mostrar perfil y menú
                  <div className="flex items-center space-x-4">
                    {/* Enlaces de navegación para usuarios autenticados */}
                    <div className="hidden md:flex items-center space-x-4">
                      <Link 
                        href="/dashboard" 
                        className="text-gray-600 hover:text-primary transition-colors duration-300 text-sm font-medium"
                      >
                        Dashboard
                      </Link>
                      <Link 
                        href="/chat" 
                        className="text-gray-600 hover:text-secondary transition-colors duration-300 text-sm font-medium"
                      >
                        Chat
                      </Link>
                      <Link 
                        href="/reminders" 
                        className="text-gray-600 hover:text-primary transition-colors duration-300 text-sm font-medium"
                      >
                        Recordatorios
                      </Link>
                    </div>
                    
                    {/* Dropdown de perfil */}
                    <div className="relative">
                      <button 
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="flex items-center space-x-2 focus:outline-none"
                      >
                        <div className="bg-gradient-to-r from-primary to-secondary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium uppercase shadow-md">
                          {getUserName().charAt(0)}
                        </div>
                        <span className="hidden md:inline-block text-sm text-gray-700 font-medium">
                          {getUserName()}
                        </span>
                        <svg 
                          className={`w-4 h-4 text-gray-500 transition-transform ${isMenuOpen ? 'transform rotate-180' : ''}`} 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      {/* Menú desplegable */}
                      {isMenuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 animate-fade-in">
                          <div className="px-4 py-2 text-xs border-b border-gray-100 bg-gradient-to-r from-blue-50 to-orange-50">
                            <span className="text-secondary font-medium">{user.email}</span>
                          </div>
                          <Link 
                            href="/profile" 
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            Mi Perfil
                          </Link>
                          <Link 
                            href="/settings" 
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            Configuración
                          </Link>
                          <button 
                            onClick={handleLogout}
                            className="block w-full text-left px-4 py-2 text-sm text-secondary hover:bg-orange-50 border-t border-gray-100"
                          >
                            Cerrar Sesión
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  // Usuario no autenticado - Mostrar login/register
                  <div className="flex items-center space-x-3">
                    <div className="hidden md:flex items-center space-x-4">
                      <Link 
                        href="/features" 
                        className="text-gray-600 hover:text-primary transition-colors duration-300 text-sm font-medium"
                      >
                        Características
                      </Link>
                      <Link 
                        href="/about" 
                        className="text-gray-600 hover:text-primary transition-colors duration-300 text-sm font-medium"
                      >
                        Nosotros
                      </Link>
                      <div className="text-xs bg-gradient-to-r from-blue-50 to-orange-50 px-3 py-1 rounded-full font-medium relative overflow-hidden group border border-orange-100">
                        <div className="absolute inset-0 bg-gradient-to-r from-secondary/10 to-transparent w-1/2 -translate-x-full group-hover:translate-x-full transition-all duration-1000"></div>
                        <span className="relative inline-block text-primary">¡Formación para la <span className="text-secondary">Excelencia</span>!</span>
                      </div>
                    </div>
                    
                    <Link 
                      href="/login" 
                      className="bg-primary hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-300 hover:shadow-md"
                    >
                      Iniciar sesión
                    </Link>
                    <Link 
                      href="/register" 
                      className="bg-secondary hover:bg-orange-600 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-300 hover:shadow-md"
                    >
                      Registrarse
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Menú móvil (se puede agregar si es necesario) */}
    </header>
  );
};


export default Header;
