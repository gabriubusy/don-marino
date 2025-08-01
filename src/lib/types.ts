export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: number;
}

export interface Reminder {
  id: string;
  title: string;
  description?: string;
  date: string; // ISO format
  completed: boolean;
  createdAt: number;
  priority?: 'high' | 'medium' | 'low';
}

export type ChatResponse = {
  text: string;
  reminder?: Omit<Reminder, 'id' | 'completed' | 'createdAt'>;
};

export interface Role {
  id: string;
  name: string;
  description?: string;
}

export interface Permission {
  id: string;
  name: string;
  description?: string;
}

export interface UserRole {
  user_id: string;
  role_id: string;
  permissions?: string[];
  Role?: Role;
}

export interface User {
  id: string;
  email: string;
  avatar?: string;
  address?: string;
  phone?: string;
  roles?: UserRole[];
}
