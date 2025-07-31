'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function RegistrationSuccess() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <Link href="/">
          <Image
            src="/logo.png"
            alt="Don Mariño Logo"
            width={120}
            height={120}
            className="mx-auto mb-4"
          />
        </Link>
        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="mt-4 text-2xl font-bold text-primary">¡Registro exitoso!</h2>
            <p className="mt-2 text-gray-600">
              Hemos enviado un correo de verificación a tu dirección email.
              Por favor, revisa tu bandeja de entrada y sigue las instrucciones para activar tu cuenta.
            </p>
            
            <div className="mt-6">
              <Link href="/login" className="text-white bg-primary hover:bg-blue-700 focus:ring-4 focus:ring-primary/20 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center mr-2">
                Ir al inicio de sesión
              </Link>
            </div>
            
            <div className="mt-4 text-sm text-gray-500">
              <p>¿No has recibido el correo? Revisa tu carpeta de spam o inténtalo de nuevo más tarde.</p>
            </div>
          </div>
        </div>
        
        <div className="text-center mt-4">
          <Link
            href="/"
            className="font-medium text-sm text-gray-600 hover:text-gray-900"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
