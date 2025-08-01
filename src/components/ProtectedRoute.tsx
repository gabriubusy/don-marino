import React from 'react';
import { useAuth } from '../lib/auth-context';
import { useRouter } from 'next/navigation';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  requiredPermissions?: string[];
  fallbackPath?: string;
}

export default function ProtectedRoute({
  children,
  requiredRoles = [],
  requiredPermissions = [],
  fallbackPath = '/login',
}: ProtectedRouteProps) {
  const { user, loading, hasRole, hasPermission } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !user) {
      // Usuario no autenticado, redirigir al login
      router.push(fallbackPath);
      return;
    }

    if (!loading && user) {
      // Verificar roles si se requieren
      if (requiredRoles.length > 0) {
        const hasRequiredRole = requiredRoles.some(role => hasRole(role));
        if (!hasRequiredRole) {
          // Usuario no tiene los roles requeridos
          router.push('/unauthorized');
          return;
        }
      }

      // Verificar permisos si se requieren
      if (requiredPermissions.length > 0) {
        const hasRequiredPermission = requiredPermissions.some(permission => 
          hasPermission(permission)
        );
        if (!hasRequiredPermission) {
          // Usuario no tiene los permisos requeridos
          router.push('/unauthorized');
          return;
        }
      }
    }
  }, [user, loading, requiredRoles, requiredPermissions, router, fallbackPath, hasRole, hasPermission]);

  // Mostrar un indicador de carga mientras se verifica la autenticación
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Cargando...</div>;
  }

  // Si no hay usuario autenticado o no tiene los permisos necesarios, no renderizar nada
  // (la redirección se maneja en el useEffect)
  if (!user || 
      (requiredRoles.length > 0 && !requiredRoles.some(role => hasRole(role))) ||
      (requiredPermissions.length > 0 && !requiredPermissions.some(perm => hasPermission(perm)))) {
    return null;
  }

  // Si el usuario está autenticado y tiene los roles/permisos necesarios, renderizar los children
  return <>{children}</>;
}
