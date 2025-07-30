export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      Users: {
        Row: {
          id: string;
          email: string;
          avatar: string | null;
          password: string;
          address: string | null;
          phone: string | null;
        };
        Insert: {
          id?: string;
          email: string;
          avatar?: string | null;
          password: string;
          address?: string | null;
          phone?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          avatar?: string | null;
          password?: string;
          address?: string | null;
          phone?: string | null;
        };
      };
      Role: {
        Row: {
          id: string;
          name: string;
          description: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
        };
      };
      UsersRole: {
        Row: {
          user_id: string;
          role_id: string;
          permissions: string[] | null;
        };
        Insert: {
          user_id: string;
          role_id: string;
          permissions?: string[] | null;
        };
        Update: {
          user_id?: string;
          role_id?: string;
          permissions?: string[] | null;
        };
      };
      Permissions: {
        Row: {
          id: string;
          name: string;
          description: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
        };
      };
      Conversation: {
        Row: {
          id: string;
          title: string;
          user_id: string;
          status: string;
        };
        Insert: {
          id?: string;
          title: string;
          user_id: string;
          status: string;
        };
        Update: {
          id?: string;
          title?: string;
          user_id?: string;
          status?: string;
        };
      };
      Intent: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          parameters: Json | null;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          parameters?: Json | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          parameters?: Json | null;
        };
      };
      Message: {
        Row: {
          id: string;
          content: string;
          intent_id: string | null;
          is_read: boolean;
          sender_type: string;
        };
        Insert: {
          id?: string;
          content: string;
          intent_id?: string | null;
          is_read?: boolean;
          sender_type: string;
        };
        Update: {
          id?: string;
          content?: string;
          intent_id?: string | null;
          is_read?: boolean;
          sender_type?: string;
        };
      };
      NotificationsSettings: {
        Row: {
          id: string;
          user_id: string;
          whatsapp_active: boolean;
          push_active: boolean;
          email_active: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          whatsapp_active?: boolean;
          push_active?: boolean;
          email_active?: boolean;
        };
        Update: {
          id?: string;
          user_id?: string;
          whatsapp_active?: boolean;
          push_active?: boolean;
          email_active?: boolean;
        };
      };
      Groups: {
        Row: {
          id: string;
          user_id: string;
          users: string[] | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          users?: string[] | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          users?: string[] | null;
        };
      };
      Reminder: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          user_id: string;
          priority: number;
          due_date: string;
          recurrence: string | null;
          group_id: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          user_id: string;
          priority: number;
          due_date: string;
          recurrence?: string | null;
          group_id?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          user_id?: string;
          priority?: number;
          due_date?: string;
          recurrence?: string | null;
          group_id?: string | null;
        };
      };
      Notification: {
        Row: {
          id: string;
          reminder_id: string;
          status: string;
          schedules_for: string;
        };
        Insert: {
          id?: string;
          reminder_id: string;
          status: string;
          schedules_for: string;
        };
        Update: {
          id?: string;
          reminder_id?: string;
          status?: string;
          schedules_for?: string;
        };
      };
      NotificationLog: {
        Row: {
          id: string;
          notification_id: string;
          send: boolean;
          error: string | null;
        };
        Insert: {
          id?: string;
          notification_id: string;
          send: boolean;
          error?: string | null;
        };
        Update: {
          id?: string;
          notification_id?: string;
          send?: boolean;
          error?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
