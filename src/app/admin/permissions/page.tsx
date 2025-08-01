'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../lib/auth-context';
import { getAllPermissions, createPermission } from '../../../lib/supabase';
import { Permission } from '../../../lib/types';
import ProtectedRoute from '../../../components/ProtectedRoute';

export default function PermissionsPage() {
  return (
    <ProtectedRoute requiredRoles={['Admin']}>
      <PermissionsManagement />
    </ProtectedRoute>
  );
}

function PermissionsManagement() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissionName, setPermissionName] = useState('');
  const [permissionDescription, setPermissionDescription] = useState('');
  
  const { user } = useAuth();

  // Cargar permisos al montar el componente
  useEffect(() => {
    const fetchPermissions = async () => {
      setLoading(true);
      try {
        const { data, error: fetchError } = await getAllPermissions();
        if (fetchError) throw fetchError;
        setPermissions(data || []);
      } catch (err) {
        console.error('Error loading permissions:', err);
        setError('Error al cargar los permisos. Por favor, inténtalo de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, []);

  // Manejar la creación de un nuevo permiso
  const handleCreatePermission = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!permissionName.trim()) {
      setError('El nombre del permiso es obligatorio');
      return;
    }

    setLoading(true);
    try {
      const { data, error: createError } = await createPermission(
        permissionName, 
        permissionDescription || null
      );
      
      if (createError) throw createError;
      
      // Actualizar la lista de permisos
      setPermissions([...permissions, data as Permission]);
      
      // Limpiar el formulario
      setPermissionName('');
      setPermissionDescription('');
      setError(null);
      
    } catch (err: any) {
      setError(err.message || 'Error al crear el permiso');
    } finally {
      setLoading(false);
    }
  };

  if (loading && permissions.length === 0) {
    return <div className="flex justify-center items-center h-screen">Cargando...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Gestión de Permisos</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Lista de permisos */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Permisos existentes</h2>
          
          {permissions.length === 0 ? (
            <p>No hay permisos definidos todavía.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descripción
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {permissions.map((permission) => (
                    <tr key={permission.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {permission.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {permission.description || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Formulario para crear nuevos permisos */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Crear Nuevo Permiso</h2>
          
          <form onSubmit={handleCreatePermission}>
            <div className="mb-4">
              <label htmlFor="permissionName" className="block text-sm font-medium text-gray-700">
                Nombre
              </label>
              <input
                type="text"
                id="permissionName"
                value={permissionName}
                onChange={(e) => setPermissionName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nombre del permiso"
                required
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="permissionDescription" className="block text-sm font-medium text-gray-700">
                Descripción
              </label>
              <textarea
                id="permissionDescription"
                value={permissionDescription}
                onChange={(e) => setPermissionDescription(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Descripción del permiso"
                rows={3}
              />
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={loading}
              >
                {loading ? 'Creando...' : 'Crear Permiso'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Sugerencias de permisos comunes */}
      <div className="bg-white rounded-lg shadow-md p-6 mt-8">
        <h2 className="text-xl font-semibold mb-4">Permisos Comunes</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: 'create:user', description: 'Crear usuarios' },
            { name: 'read:user', description: 'Ver usuarios' },
            { name: 'update:user', description: 'Actualizar usuarios' },
            { name: 'delete:user', description: 'Eliminar usuarios' },
            { name: 'create:reminder', description: 'Crear recordatorios' },
            { name: 'read:reminder', description: 'Ver recordatorios' },
            { name: 'update:reminder', description: 'Actualizar recordatorios' },
            { name: 'delete:reminder', description: 'Eliminar recordatorios' },
          ].map((suggestion, index) => (
            <div 
              key={index} 
              className="p-3 border rounded-md cursor-pointer hover:bg-blue-50"
              onClick={() => {
                setPermissionName(suggestion.name);
                setPermissionDescription(suggestion.description);
              }}
            >
              <div className="font-medium">{suggestion.name}</div>
              <div className="text-sm text-gray-600">{suggestion.description}</div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-gray-500">
          Haz clic en una sugerencia para usarla en el formulario de creación.
        </p>
      </div>
    </div>
  );
}
