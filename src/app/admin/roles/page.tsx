  'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../lib/auth-context';
import { getAllRoles, createRole, updateRole, getAllPermissions, assignRoleToUser } from '../../../lib/supabase';
import { Role, Permission, User } from '../../../lib/types';
import ProtectedRoute from '../../../components/ProtectedRoute';

export default function RolesPage() {
  return (
    <ProtectedRoute requiredRoles={['Admin']}>
      <RolesManagement />
    </ProtectedRoute>
  );
}

function RolesManagement() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [roleName, setRoleName] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  
  const { user } = useAuth();

  // Cargar roles, permisos y usuarios al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Cargar roles
        const { data: rolesData, error: rolesError } = await getAllRoles();
        if (rolesError) throw rolesError;
        setRoles(rolesData || []);

        // Cargar permisos
        const { data: permissionsData, error: permissionsError } = await getAllPermissions();
        if (permissionsError) throw permissionsError;
        setPermissions(permissionsData || []);

        // Cargar usuarios
        const { data: usersData, error: usersError } = await fetch('/api/users')
          .then(res => res.json());
        if (usersError) throw usersError;
        setUsers(usersData || []);

      } catch (err) {
        console.error('Error loading data:', err);
        setError('Error al cargar los datos. Por favor, inténtalo de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Manejar la creación de un nuevo rol
  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!roleName.trim()) {
      setError('El nombre del rol es obligatorio');
      return;
    }

    setLoading(true);
    try {
      const { data, error: createError } = await createRole(roleName, roleDescription || null);
      if (createError) throw createError;
      
      // Actualizar la lista de roles
      setRoles([...roles, data as Role]);
      
      // Limpiar el formulario
      setRoleName('');
      setRoleDescription('');
      setError(null);
      
    } catch (err: any) {
      setError(err.message || 'Error al crear el rol');
    } finally {
      setLoading(false);
    }
  };

  // Manejar la actualización de un rol existente
  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRole || !roleName.trim()) {
      setError('El nombre del rol es obligatorio');
      return;
    }

    setLoading(true);
    try {
      const { data, error: updateError } = await updateRole(selectedRole.id, {
        name: roleName,
        description: roleDescription || null
      });
      
      if (updateError) throw updateError;
      
      // Actualizar la lista de roles
      setRoles(roles.map(role => 
        role.id === selectedRole.id ? { ...role, name: roleName, description: roleDescription } : role
      ));
      
      // Salir del modo edición
      setIsEditing(false);
      setSelectedRole(null);
      setRoleName('');
      setRoleDescription('');
      setError(null);
      
    } catch (err: any) {
      setError(err.message || 'Error al actualizar el rol');
    } finally {
      setLoading(false);
    }
  };

  // Editar un rol existente
  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setRoleName(role.name);
    setRoleDescription(role.description || '');
    setIsEditing(true);
  };

  // Cancelar la edición
  const handleCancelEdit = () => {
    setIsEditing(false);
    setSelectedRole(null);
    setRoleName('');
    setRoleDescription('');
  };

  // Asignar rol a un usuario
  const handleAssignRoleToUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUser || !selectedRole) {
      setError('Debes seleccionar un usuario y un rol');
      return;
    }

    setLoading(true);
    try {
      const { error: assignError } = await assignRoleToUser(
        selectedUser, 
        selectedRole.id,
        selectedPermissions
      );
      
      if (assignError) throw assignError;
      
      // Limpiar el formulario
      setSelectedUser('');
      setSelectedRole(null);
      setSelectedPermissions([]);
      setError(null);
      
    } catch (err: any) {
      setError(err.message || 'Error al asignar el rol al usuario');
    } finally {
      setLoading(false);
    }
  };

  // Toggle selección de permisos
  const togglePermission = (permissionId: string) => {
    if (selectedPermissions.includes(permissionId)) {
      setSelectedPermissions(selectedPermissions.filter(id => id !== permissionId));
    } else {
      setSelectedPermissions([...selectedPermissions, permissionId]);
    }
  };

  if (loading && roles.length === 0) {
    return <div className="flex justify-center items-center h-screen">Cargando...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Gestión de Roles</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Lista de roles */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Roles existentes</h2>
          
          {roles.length === 0 ? (
            <p>No hay roles definidos todavía.</p>
          ) : (
            <ul className="space-y-2">
              {roles.map(role => (
                <li 
                  key={role.id}
                  className="p-3 hover:bg-gray-50 border-b cursor-pointer flex justify-between"
                  onClick={() => handleEditRole(role)}
                >
                  <div>
                    <span className="font-medium">{role.name}</span>
                    {role.description && (
                      <p className="text-sm text-gray-500">{role.description}</p>
                    )}
                  </div>
                  <button 
                    className="text-blue-500 hover:text-blue-700"
                    onClick={(e) => { 
                      e.stopPropagation();
                      handleEditRole(role);
                    }}
                  >
                    Editar
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Formulario para crear/editar roles */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">
            {isEditing ? 'Editar Rol' : 'Crear Nuevo Rol'}
          </h2>
          
          <form onSubmit={isEditing ? handleUpdateRole : handleCreateRole}>
            <div className="mb-4">
              <label htmlFor="roleName" className="block text-sm font-medium text-gray-700">
                Nombre
              </label>
              <input
                type="text"
                id="roleName"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nombre del rol"
                required
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="roleDescription" className="block text-sm font-medium text-gray-700">
                Descripción
              </label>
              <textarea
                id="roleDescription"
                value={roleDescription}
                onChange={(e) => setRoleDescription(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Descripción del rol"
                rows={3}
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              {isEditing && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  disabled={loading}
                >
                  Cancelar
                </button>
              )}
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={loading}
              >
                {loading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </div>

        {/* Asignar roles a usuarios */}
        <div className="bg-white rounded-lg shadow-md p-6 md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Asignar Rol a Usuario</h2>
          
          <form onSubmit={handleAssignRoleToUser}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label htmlFor="userSelect" className="block text-sm font-medium text-gray-700">
                  Usuario
                </label>
                <select
                  id="userSelect"
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Seleccionar usuario</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.email}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="roleSelect" className="block text-sm font-medium text-gray-700">
                  Rol
                </label>
                <select
                  id="roleSelect"
                  value={selectedRole?.id || ''}
                  onChange={(e) => {
                    const role = roles.find(r => r.id === e.target.value);
                    setSelectedRole(role || null);
                  }}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Seleccionar rol</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Lista de permisos */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Permisos adicionales
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {permissions.map(permission => (
                  <div key={permission.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`permission-${permission.id}`}
                      checked={selectedPermissions.includes(permission.id)}
                      onChange={() => togglePermission(permission.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label 
                      htmlFor={`permission-${permission.id}`}
                      className="ml-2 block text-sm text-gray-900"
                    >
                      {permission.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={loading}
              >
                {loading ? 'Asignando...' : 'Asignar Rol'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
