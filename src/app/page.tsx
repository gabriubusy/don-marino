'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ChatContainer from '@/components/ChatContainer';
import RemindersList from '@/components/RemindersList';
import { Reminder } from '@/lib/types';

export default function Home() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [activeTab, setActiveTab] = useState<'chat' | 'reminders'>('chat');

  // Load reminders from localStorage on component mount
  useEffect(() => {
    const savedReminders = localStorage.getItem('reminders');
    if (savedReminders) {
      setReminders(JSON.parse(savedReminders));
    }
  }, []);

  // Save reminders to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('reminders', JSON.stringify(reminders));
  }, [reminders]);

  // Function to add a new reminder
  const addReminder = (reminder: Reminder) => {
    setReminders((prev) => [...prev, reminder]);
  };

  // Function to delete a reminder
  const deleteReminder = (id: string) => {
    setReminders((prev) => prev.filter((reminder) => reminder.id !== id));
  };

  return (
    <main className="flex flex-col h-screen">
      <Header />
      
      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          className={`flex-1 py-3 text-center font-medium ${
            activeTab === 'chat'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-500'
          }`}
          onClick={() => setActiveTab('chat')}
        >
          Chat
        </button>
        <button
          className={`flex-1 py-3 text-center font-medium ${
            activeTab === 'reminders'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-500'
          }`}
          onClick={() => setActiveTab('reminders')}
        >
          Recordatorios
        </button>
      </div>

      {/* Content based on active tab */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'chat' ? (
          <ChatContainer addReminder={addReminder} />
        ) : (
          <RemindersList reminders={reminders} deleteReminder={deleteReminder} />
        )}
      </div>
    </main>
  );
}
