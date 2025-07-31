'use client';

import { useState } from 'react';
import Link from 'next/link';

type ActionItem = {
  label: string;
  icon: string;
  href: string;
  color: string;
};

const FloatingActionButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const actions: ActionItem[] = [
    {
      label: 'Iniciar sesión',
      icon: '👤',
      href: '/login',
      color: 'bg-primary',
    },
    {
      label: 'Registrarse',
      icon: '📝',
      href: '/register',
      color: 'bg-secondary',
    },
    {
      label: 'Chat con Don Mariño',
      icon: '💬',
      href: '/dashboard',
      color: 'bg-green-600',
    },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Menú expandido */}
      <div className={`flex flex-col-reverse gap-3 mb-4 transition-all duration-300 ${isOpen ? 'opacity-100 transform translate-y-0' : 'opacity-0 invisible transform translate-y-10'}`}>
        {actions.map((action, index) => (
          <Link href={action.href} key={index}>
            <div
              className={`${action.color} hover:brightness-110 shadow-lg w-auto flex items-center gap-2 rounded-full p-3 pl-4 pr-5 text-white transition-all duration-200 cursor-pointer`}
            >
              <span className="text-xl">{action.icon}</span>
              <span className="font-medium text-sm whitespace-nowrap">{action.label}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Botón principal */}
      <button
        onClick={toggleMenu}
        className={`bg-secondary hover:bg-orange-600 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl transition-transform duration-300 ${
          isOpen ? 'rotate-45' : ''
        }`}
        aria-label="Menú de acciones"
      >
        <span className="transform transition-transform">
          {isOpen ? '×' : '+'}
        </span>
      </button>
    </div>
  );
};

export default FloatingActionButton;
