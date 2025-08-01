'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabase';
import { getUserRoles, getUserPermissions } from './supabase';
import { User, UserRole, Permission } from './types';

// Define el tipo de contexto de autenticación
interface AuthContextType {
  user: User | null;
  userRoles: UserRole[];
  permissions: string[];
  loading: boolean;
  error: Error | null;
  login: (email: string, password: string) => Promise<{ data: any; error: any }>;
  logout: () => Promise<void>;
  register: (email: string, password: string) => Promise<{ data: any; error: any }>;
  hasRole: (roleName: string) => boolean;
  hasPermission: (permissionName: string) => boolean;
}

// Crear el contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook personalizado para utilizar el contexto de autenticación
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Proveedor de autenticación
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Cargar usuario y roles al inicio
  useEffect(() => {
    // Establecer el listener de autenticación
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          await loadUserData(session.user.id);
        }
      }
      
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserRoles([]);
        setPermissions([]);
      }
      
      setLoading(false);
    });

    // Verificar si hay una sesión activa al cargar
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await loadUserData(session.user.id);
      }
      setLoading(false);
    };
    
    checkSession();

    // Limpieza del listener al desmontar
    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  // Función auxiliar para cargar datos del usuario
  const loadUserData = async (userId: string) => {
    try {
      setLoading(true);
      
      // Obtener datos del usuario
      const { data: userData, error: userError } = await supabase
        .from('Users')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (userError) throw userError;
      
      // Obtener roles del usuario
      const { data: rolesData, error: rolesError } = await getUserRoles(userId);
      if (rolesError) throw rolesError;
      
      // Transformar los datos de roles para que coincidan con la interfaz UserRole
      const formattedRoles: UserRole[] = (rolesData || []).map(roleData => ({
        user_id: userId,
        role_id: roleData.role_id,
        permissions: roleData.permissions,
        Role: Array.isArray(roleData.Role) ? roleData.Role[0] : roleData.Role
      }));
      
      // Obtener permisos del usuario
      const { data: userPermissions, error: permissionsError } = await getUserPermissions(userId);
      if (permissionsError) throw permissionsError;
      
      setUser(userData as User);
      setUserRoles(formattedRoles);
      setPermissions(userPermissions || []);
      
    } catch (err) {
      setError(err as Error);
      console.error('Error loading user data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Función de inicio de sesión
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      return { data, error };
    } catch (err) {
      setError(err as Error);
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  // Función de cierre de sesión
  const logout = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      setUser(null);
      setUserRoles([]);
      setPermissions([]);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  // Función de registro
  const register = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({ email, password });
      return { data, error };
    } catch (err) {
      setError(err as Error);
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  // Función para verificar si el usuario tiene un rol específico
  const hasRole = (roleName: string) => {
    console.log('Holi',userRoles);
    return userRoles.some(role => role.Role?.name === roleName);
  };

  // Función para verificar si el usuario tiene un permiso específico
  const hasPermission = (permissionName: string) => {
    return permissions.includes(permissionName);
  };

  // Valor del contexto
  const value: AuthContextType = {
    user,
    userRoles,
    permissions,
    loading,
    error,
    login,
    logout,
    register,
    hasRole,
    hasPermission,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
