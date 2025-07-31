'use client';

import React, { useState } from 'react';

interface ConfirmEmailModalProps {
  email: string;
  onClose: () => void;
  onResend: (email: string) => Promise<{ success: boolean; message: string }>;
}

const ConfirmEmailModal: React.FC<ConfirmEmailModalProps> = ({ email, onClose, onResend }) => {
  const [status, setStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error'; message?: string }>({ type: 'idle' });

  const handleResend = async () => {
    setStatus({ type: 'loading' });
    
    try {
      const result = await onResend(email);
      
      if (result.success) {
        setStatus({ 
          type: 'success',
          message: result.message || 'Correo enviado correctamente. Por favor revisa tu bandeja de entrada.'
        });
      } else {
        setStatus({ 
          type: 'error',
          message: result.message || 'Ha ocurrido un error al enviar el correo.'
        });
      }
    } catch (error: any) {
      setStatus({ 
        type: 'error',
        message: error.message || 'Ha ocurrido un error al enviar el correo.'
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all animate-scale-in p-6">
        <div className="text-center mb-6">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
            <svg className="h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Verificación de correo</h2>
          <p className="mt-2 text-gray-600">
            Tu correo <span className="font-medium text-primary">{email}</span> no ha sido verificado. 
            Por favor revisa tu bandeja de entrada o reenvía el correo de verificación.
          </p>
        </div>
        
        {status.type === 'success' ? (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{status.message}</p>
              </div>
            </div>
          </div>
        ) : status.type === 'error' ? (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{status.message}</p>
              </div>
            </div>
          </div>
        ) : null}

        <div className="mt-6 flex flex-col sm:flex-row-reverse gap-3">
          <button
            type="button"
            onClick={handleResend}
            disabled={status.type === 'loading' || status.type === 'success'}
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-300 transform disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto sm:text-sm"
          >
            {status.type === 'loading' ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              'Reenviar correo de verificación'
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:w-auto sm:text-sm"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmEmailModal;
