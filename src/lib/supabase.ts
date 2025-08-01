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
