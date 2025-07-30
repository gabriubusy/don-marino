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
}

export type ChatResponse = {
  text: string;
  reminder?: Omit<Reminder, 'id' | 'completed' | 'createdAt'>;
};
