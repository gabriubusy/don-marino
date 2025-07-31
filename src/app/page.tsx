'use client';

import Link from 'next/link';
import Image from 'next/image';
import FloatingActionButton from '@/components/FloatingActionButton';
import { useEffect, useState } from 'react';

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);

  // Evitar hidratación para animaciones
  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <main className="min-h-screen bg-white">
      {/* Barra de navegación */}
      <nav className="bg-white shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Image 
                src="/logo.png" 
                alt="Don Mariño Logo" 
                width={48} 
                height={48}
                className="mr-2" 
              />
              <span className="text-primary font-bold text-xl">Don Mariño</span>
            </div>
            <div className="flex space-x-4">
              <Link 
                href="/login" 
                className="bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Iniciar sesión
              </Link>
              <Link 
                href="/register" 
                className="bg-secondary hover:bg-orange-600 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Registrarse
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-white to-blue-50 py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary tracking-tight mb-4">
              Tu asistente inteligente para
              <span className="text-secondary"> recordatorios</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Don Mariño es un chatbot inteligente que te ayuda a gestionar tus recordatorios 
              de manera fácil y eficiente, utilizando inteligencia artificial para entender 
              tu lenguaje natural.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link 
                href="/register" 
                className="bg-secondary hover:bg-orange-600 text-white px-6 py-3 rounded-md text-base font-medium shadow-lg hover:shadow-xl transition duration-300"
              >
                Comenzar ahora
              </Link>
              <Link 
                href="/dashboard" 
                className="bg-white hover:bg-gray-100 text-primary border border-primary px-6 py-3 rounded-md text-base font-medium shadow-md hover:shadow-lg transition duration-300"
              >
                Probar demo
              </Link>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <div className="relative w-full max-w-md">
              <Image 
                src="/hero-image.png" 
                alt="Don Mariño en acción" 
                width={500} 
                height={400}
                className="rounded-lg shadow-2xl" 
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Características */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-primary mb-12">Características principales</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-blue-50 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="text-4xl text-secondary mb-4">💬</div>
              <h3 className="text-xl font-bold text-primary mb-2">Chat intuitivo</h3>
              <p className="text-gray-600">
                Interactúa con Don Mariño como lo harías con un asistente real, utilizando lenguaje natural.
              </p>
            </div>
            
            <div className="bg-blue-50 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="text-4xl text-secondary mb-4">🧠</div>
              <h3 className="text-xl font-bold text-primary mb-2">IA en tu navegador</h3>
              <p className="text-gray-600">
                Aprovecha el poder de la inteligencia artificial directamente en tu dispositivo sin dependencias externas de pago.
              </p>
            </div>
            
            <div className="bg-blue-50 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="text-4xl text-secondary mb-4">🔔</div>
              <h3 className="text-xl font-bold text-primary mb-2">Recordatorios eficientes</h3>
              <p className="text-gray-600">
                Crea y gestiona recordatorios fácilmente, con detección automática de fechas y eventos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="py-16 bg-blue-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-primary mb-12">¿Cómo funciona?</h2>
          
          <div className="space-y-12">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="md:w-1/2 order-2 md:order-1">
                <div className="bg-white p-6 rounded-lg shadow-lg">
                  <h3 className="text-xl font-bold text-primary mb-2">Paso 1: Conversa naturalmente</h3>
                  <p className="text-gray-600 mb-4">
                    Simplemente conversa con Don Mariño como lo harías con un asistente real. 
                    Escribe lo que necesitas y él entenderá tus intenciones.
                  </p>
                  <div className="bg-gray-100 p-3 rounded-md">
                    <p className="text-sm text-gray-700">"Recuérdame comprar leche mañana a las 9 AM"</p>
                  </div>
                </div>
              </div>
              <div className="md:w-1/2 order-1 md:order-2 flex justify-center">
                <div className="relative w-full max-w-sm">
                  <Image 
                    src="/step1.png" 
                    alt="Conversación con Don Mariño" 
                    width={300} 
                    height={250}
                    className="rounded-lg shadow-md" 
                  />
                </div>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="md:w-1/2 flex justify-center">
                <div className="relative w-full max-w-sm">
                  <Image 
                    src="/step2.png" 
                    alt="Don Mariño procesando información" 
                    width={300} 
                    height={250}
                    className="rounded-lg shadow-md" 
                  />
                </div>
              </div>
              <div className="md:w-1/2">
                <div className="bg-white p-6 rounded-lg shadow-lg">
                  <h3 className="text-xl font-bold text-primary mb-2">Paso 2: IA en acción</h3>
                  <p className="text-gray-600 mb-4">
                    La IA de Don Mariño procesa tu mensaje, identifica fechas, horarios y 
                    contexto importante para crear el recordatorio adecuado.
                  </p>
                  <div className="bg-gray-100 p-3 rounded-md">
                    <p className="text-sm text-gray-700">Procesando: Tarea "comprar leche" → Fecha: mañana → Hora: 9:00 AM</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="md:w-1/2 order-2 md:order-1">
                <div className="bg-white p-6 rounded-lg shadow-lg">
                  <h3 className="text-xl font-bold text-primary mb-2">Paso 3: Gestiona tus recordatorios</h3>
                  <p className="text-gray-600 mb-4">
                    Accede a todos tus recordatorios en un solo lugar, editarlos o marcarlos como completados 
                    cuando termines tus tareas.
                  </p>
                  <div className="bg-gray-100 p-3 rounded-md">
                    <p className="text-sm text-gray-700">"Ver mis recordatorios de esta semana"</p>
                  </div>
                </div>
              </div>
              <div className="md:w-1/2 order-1 md:order-2 flex justify-center">
                <div className="relative w-full max-w-sm">
                  <Image 
                    src="/step3.png" 
                    alt="Lista de recordatorios" 
                    width={300} 
                    height={250}
                    className="rounded-lg shadow-md" 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-secondary py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">¿Listo para optimizar tu tiempo?</h2>
          <p className="text-lg text-white mb-8 max-w-3xl mx-auto">
            Únete a miles de usuarios que confían en Don Mariño para gestionar sus recordatorios diarios.
            Sin costos adicionales, usando tecnología de IA gratuita y de código abierto.
          </p>
          <Link 
            href="/register" 
            className="bg-white hover:bg-gray-100 text-secondary font-bold px-8 py-4 rounded-md text-lg shadow-lg hover:shadow-xl transition duration-300"
          >
            Comenzar gratis
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-white py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Image 
                src="/logo-white.png" 
                alt="Don Mariño Logo" 
                width={40} 
                height={40}
                className="mr-2" 
              />
              <span className="text-xl font-bold">Don Mariño</span>
            </div>
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-8">
              <Link href="/about" className="hover:text-gray-300">Acerca de</Link>
              <Link href="/privacy" className="hover:text-gray-300">Privacidad</Link>
              <Link href="/terms" className="hover:text-gray-300">Términos de uso</Link>
              <Link href="/contact" className="hover:text-gray-300">Contacto</Link>
            </div>
          </div>
          <div className="mt-8 text-center text-sm text-gray-300">
            &copy; {new Date().getFullYear()} Don Mariño. Todos los derechos reservados.
          </div>
        </div>
      </footer>

      {/* Botón flotante de acciones */}
      {isMounted && <FloatingActionButton />}
    </main>
  );
}
