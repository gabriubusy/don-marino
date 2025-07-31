import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient, User, AuthError, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';

// Inicializar el cliente de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

/**
 * Hook personalizado para la autenticación y gestión de usuarios
 */
export const useAuth = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Comprobar sesión activa al cargar el componente
  useEffect(() => {
    const checkUser = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser(session.user);
      }
      
      setLoading(false);
    };

    // Suscribirse a cambios en la autenticación
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    checkUser();

    // Limpieza al desmontar el componente
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  /**
   * Iniciar sesión con email y contraseña
   */
  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });

      if (error) throw error;
      if (data.user) {
        setUser(data.user);
        return { success: true };
      }
      return { success: false, message: 'No se pudo iniciar sesión' };
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
      return { success: false, message: err.message || 'Error al iniciar sesión' };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Registrar un nuevo usuario y crear entrada en tabla Users
   */
  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      // Registrar usuario en Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: { full_name: name }
        }
      });

      console.log(authData);

      if (authError) throw authError;
      
      // Si el registro es exitoso, crear entrada en tabla Users
      if (authData?.user) {
        // Crear entrada en la tabla Users según la estructura real
        const { error: userError } = await supabase.from('Users').insert([
          { 
            user_id: authData.user.id, // Añadiendo el campo user_uid con el ID del usuario
            email: email,
            // Almacenamos el nombre en el campo address temporalmente ya que no hay full_name
            address: name, // Usando address para almacenar el nombre completo
            avatar: null, // Valor por defecto para avatar
            phone: null, // Valor por defecto para phone
            created_at: new Date().toISOString(),
          }
        ]);

        if (userError) {
          console.error('Error al crear registro de usuario:', userError);
          // No lanzamos el error para evitar problemas en el flujo de registro
          // ya que el usuario se creó correctamente en Auth
        }
        
        setUser(authData.user);
        return true;
      }
      return false;
    } catch (err: any) {
      setError(err.message || 'Error al registrar usuario');
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cerrar sesión
   */
  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      setUser(null);
      router.push('/login');
    } catch (err: any) {
      setError(err.message || 'Error al cerrar sesión');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Enviar correo para restablecer contraseña
   */
  const resetPassword = async (email: string): Promise<{ success: boolean, message: string }> => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/reset-password`,
      });

      if (error) throw error;
      
      return { 
        success: true, 
        message: 'Hemos enviado un enlace para restablecer tu contraseña a tu correo electrónico.' 
      };
    } catch (err: any) {
      setError(err.message || 'Error al enviar correo de recuperación');
      return { 
        success: false, 
        message: err.message || 'No se pudo enviar el correo de restablecimiento. Inténtalo de nuevo.'
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Actualizar contraseña del usuario
   */
  const updatePassword = async (newPassword: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      
      return true;
    } catch (err: any) {
      setError(err.message || 'Error al actualizar contraseña');
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Protección de rutas - Redireccionar si no hay sesión
   */
  const requireAuth = () => {
    if (!loading && !user) {
      router.push('/login');
    }
  };

  // Función para reenviar el correo de verificación de email
  const resendConfirmationEmail = async (email: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });
      
      if (error) throw error;
      
      return { success: true, message: 'Correo de verificación enviado correctamente' };
    } catch (error: any) {
      console.error('Error al reenviar el correo de verificación:', error.message);
      setError(error.message);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    resetPassword,
    updatePassword,
    requireAuth,
    resendConfirmationEmail
  };
};
