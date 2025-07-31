'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import LoadingScreen from '@/components/LoadingScreen';
import Header from '@/components/Header';

export default function Profile() {
  const { user, loading, requireAuth, logout } = useAuth();
  const router = useRouter();
  const [showLoading, setShowLoading] = useState(true);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    avatar: '',
    phone: '',
    address: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  // Proteger la ruta
  useEffect(() => {
    requireAuth();
  }, [requireAuth]);
  
  // Mostrar pantalla de carga por un mínimo de tiempo para mejor experiencia
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 3500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Cargar datos del usuario
  useEffect(() => {
    if (user) {
      // Intentar obtener el nombre del usuario desde los metadatos
      const name = user.user_metadata?.full_name || user.email?.split('@')[0] || '';
      
      setUserData({
        name,
        email: user.email || '',
        avatar: user.user_metadata?.avatar_url || '',
        phone: user.user_metadata?.phone || '',
        address: user.user_metadata?.address || ''
      });
    }
  }, [user]);
  
  // Simulación de actualización de perfil (deberás conectarlo con Supabase)
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSaving(true);
    setMessage({ text: '', type: '' });
    
    // Aquí harías la llamada a la API para actualizar el perfil
    // Por ejemplo, con Supabase
    
    setTimeout(() => {
      setIsSaving(false);
      setIsEditing(false);
      setMessage({ text: 'Perfil actualizado correctamente', type: 'success' });
      
      // Limpiar el mensaje después de 5 segundos
      setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 5000);
    }, 1500);
  };
  
  // Si está cargando o el timer de carga no ha terminado, mostrar pantalla de carga
  if (loading || showLoading) {
    return <LoadingScreen />;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">
      <Header />
      <div className="pt-28 pb-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Cabecera del perfil */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-primary to-primary-dark p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-x-1/4 -translate-y-1/2"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary opacity-20 rounded-full -translate-x-1/2 translate-y-1/2"></div>
              
              <div className="flex items-center relative z-10">
                <div className="mr-6 relative">
                  <div className="w-24 h-24 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center text-3xl font-bold shadow-lg border-4 border-white relative overflow-hidden">
                    {userData.avatar ? (
                      <Image
                        src={userData.avatar}
                        alt={userData.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <span>{userData.name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold mb-1">{userData.name}</h1>
                  <p className="text-blue-100">{userData.email}</p>
                </div>
                <div className="ml-auto">
                  <button 
                    onClick={() => setIsEditing(!isEditing)}
                    className="bg-white text-primary hover:bg-blue-50 px-4 py-2 rounded-lg shadow-md transition-all duration-300 flex items-center"
                  >
                    <svg 
                      className="w-4 h-4 mr-2" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    {isEditing ? 'Cancelar' : 'Editar perfil'}
                  </button>
                </div>
              </div>
            </div>
            
            {/* Mensaje de estado */}
            {message.text && (
              <div className={`px-8 py-3 text-sm ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'} animate-fade-in`}>
                <p>{message.text}</p>
              </div>
            )}
            
            {/* Información del perfil o formulario de edición */}
            <div className="p-8">
              {isEditing ? (
                <form onSubmit={handleUpdateProfile}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre completo
                      </label>
                      <input
                        type="text"
                        value={userData.name}
                        onChange={(e) => setUserData({...userData, name: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={userData.email}
                        disabled
                        className="w-full p-2 border border-gray-200 rounded-md bg-gray-50 text-gray-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">El email no se puede cambiar</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        value={userData.phone}
                        onChange={(e) => setUserData({...userData, phone: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Ej. +56 9 1234 5678"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        URL de avatar (opcional)
                      </label>
                      <input
                        type="url"
                        value={userData.avatar}
                        onChange={(e) => setUserData({...userData, avatar: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="https://example.com/avatar.jpg"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dirección
                      </label>
                      <textarea
                        value={userData.address}
                        onChange={(e) => setUserData({...userData, address: e.target.value})}
                        rows={3}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Dirección completa"
                      ></textarea>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                      disabled={isSaving}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-all duration-300 flex items-center"
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Guardando...
                        </>
                      ) : (
                        'Guardar cambios'
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Nombre completo</h3>
                      <p className="mt-1 text-lg">{userData.name || 'No especificado'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Email</h3>
                      <p className="mt-1 text-lg">{userData.email}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Teléfono</h3>
                      <p className="mt-1 text-lg">{userData.phone || 'No especificado'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Avatar</h3>
                      <p className="mt-1 text-lg">{userData.avatar ? 'URL personalizada' : 'Usando inicial'}</p>
                    </div>
                    <div className="md:col-span-2">
                      <h3 className="text-sm font-medium text-gray-500">Dirección</h3>
                      <p className="mt-1 text-lg">{userData.address || 'No especificada'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Acciones adicionales */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Acciones de cuenta</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium">Cambiar contraseña</h3>
                    <p className="text-sm text-gray-500">Actualiza tu contraseña por seguridad</p>
                  </div>
                  <button 
                    onClick={() => router.push('/change-password')}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md transition-all duration-300"
                  >
                    Cambiar
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-red-600">Eliminar cuenta</h3>
                    <p className="text-sm text-red-500">Esta acción no se puede deshacer</p>
                  </div>
                  <button 
                    className="bg-white border border-red-300 hover:bg-red-100 text-red-600 px-4 py-2 rounded-md transition-all duration-300"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
