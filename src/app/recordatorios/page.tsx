'use client';

import { Suspense } from 'react';
import LocalRemindersContainer from '@/components/LocalRemindersContainer';

export default function RecordatoriosPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-primary mb-6">Mis Recordatorios</h1>
      
      <Suspense fallback={
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      }>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <LocalRemindersContainer />
        </div>
      </Suspense>
    </div>
  );
}
