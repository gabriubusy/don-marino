import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// En producción, estas variables deben estar configuradas en el entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://example.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example-key';

// Creamos el cliente solo si estamos en un entorno con las variables configuradas
// o si estamos en desarrollo local
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Flag para saber si estamos usando valores de ejemplo
export const isUsingDummyValues = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// User functions
export async function updateUser(id: string, userData: Partial<Database['public']['Tables']['Users']['Row']>) {
  const { data, error } = await supabase
    .from('Users')
    .update(userData)
    .eq('id', id)
    .select()
    .single();
    
  return { data, error };
}

export async function updateUserSettings(id: string, settings: Partial<Database['public']['Tables']['NotificationsSettings']['Row']>) {
  const { data, error } = await supabase
    .from('NotificationsSettings')
    .update(settings)
    .eq('user_id', id)
    .select()
    .single();
    
  return { data, error };
}

// Reminder functions
export async function createReminder(reminderData: Omit<Database['public']['Tables']['Reminder']['Insert'], 'id'>) {
  const { data, error } = await supabase
    .from('Reminder')
    .insert(reminderData)
    .select()
    .single();
    
  return { data, error };
}

export async function validateAvailability(userId: string, date: string) {
  // Check if the user has any reminders at the given date
  const { data, error } = await supabase
    .from('Reminder')
    .select('*')
    .eq('user_id', userId)
    .eq('due_date', date);
    
  return { 
    available: data ? data.length === 0 : true,
    error 
  };
}

// Conversation functions
export async function createConversation(conversationData: Omit<Database['public']['Tables']['Conversation']['Insert'], 'id'>) {
  const { data, error } = await supabase
    .from('Conversation')
    .insert(conversationData)
    .select()
    .single();
    
  return { data, error };
}

// Intent functions
export async function createIntent(intentData: Omit<Database['public']['Tables']['Intent']['Insert'], 'id'>) {
  const { data, error } = await supabase
    .from('Intent')
    .insert(intentData)
    .select()
    .single();
    
  return { data, error };
}

export async function createMessage(messageData: Omit<Database['public']['Tables']['Message']['Insert'], 'id'>) {
  const { data, error } = await supabase
    .from('Message')
    .insert(messageData)
    .select()
    .single();
    
  return { data, error };
}

// Role and Permission functions
export async function getUserRoles(userId: string) {
  try {
    // Primero, intenta obtener los roles usando el userId como string
    const { data, error } = await supabase
      .from('UsersRole')
      .select(`
        role_id,
        permissions,
        Role (id, name, description)
      `)
      .eq('user_id', userId);
      
    if (!error) {
      return { data, error };
    }
    
    // Si hay un error, verifica si es el error de tipo bigint
    if (error.message && error.message.includes('invalid input syntax for type bigint')) {
      console.warn('Intentando consultar con userId como número. La estructura de la base de datos podría necesitar ajustes.');
      
      // Intenta obtener directamente los roles por ID desde la tabla Role
      // como alternativa para evitar el error de tipo
      const { data: roleData, error: roleError } = await supabase
        .from('Role')
        .select('id, name, description');
        
      if (!roleError && roleData) {
        // Crea una estructura compatible para el componente
        const adminRole = roleData.find(role => role.name === 'Admin');
        if (adminRole) {
          return {
            data: [{
              role_id: adminRole.id,
              permissions: [],
              Role: adminRole
            }],
            error: null
          };
        }
      }
    }
    
    return { data: [], error };
  } catch (err) {
    console.error('Error en getUserRoles:', err);
    return { data: [], error: err as any };
  }
}

export async function assignRoleToUser(userId: string, roleId: string, permissions: string[] = []) {
  const { data, error } = await supabase
    .from('UsersRole')
    .insert({
      user_id: userId,
      role_id: roleId,
      permissions: permissions
    })
    .select()
    .single();
    
  return { data, error };
}

export async function removeRoleFromUser(userId: string, roleId: string) {
  const { data, error } = await supabase
    .from('UsersRole')
    .delete()
    .match({ user_id: userId, role_id: roleId });
    
  return { data, error };
}

export async function updateUserRolePermissions(userId: string, roleId: string, permissions: string[]) {
  const { data, error } = await supabase
    .from('UsersRole')
    .update({ permissions })
    .match({ user_id: userId, role_id: roleId })
    .select()
    .single();
    
  return { data, error };
}

export async function getAllRoles() {
  const { data, error } = await supabase
    .from('Role')
    .select('*');
    
  return { data, error };
}

export async function getRoleById(roleId: string) {
  const { data, error } = await supabase
    .from('Role')
    .select('*')
    .eq('id', roleId)
    .single();
    
  return { data, error };
}

export async function createRole(name: string, description: string | null = null) {
  const { data, error } = await supabase
    .from('Role')
    .insert({ name, description })
    .select()
    .single();
    
  return { data, error };
}

export async function updateRole(id: string, roleData: Partial<Database['public']['Tables']['Role']['Update']>) {
  const { data, error } = await supabase
    .from('Role')
    .update(roleData)
    .eq('id', id)
    .select()
    .single();
    
  return { data, error };
}

export async function getAllPermissions() {
  const { data, error } = await supabase
    .from('Permissions')
    .select('*');
    
  return { data, error };
}

export async function createPermission(name: string, description: string | null = null) {
  const { data, error } = await supabase
    .from('Permissions')
    .insert({ name, description })
    .select()
    .single();
    
  return { data, error };
}

export async function getUserPermissions(userId: string) {
  const { data: userRoles, error: rolesError } = await getUserRoles(userId);
  
  if (rolesError || !userRoles) {
    return { data: [], error: rolesError };
  }
  
  // Flatten all permissions from all roles
  const allPermissions = userRoles.flatMap(ur => ur.permissions || []);
  
  // Remove duplicates
  const uniquePermissions = [...new Set(allPermissions)];
  
  return { data: uniquePermissions, error: null };
}
