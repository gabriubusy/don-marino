import React from 'react';
import Image from 'next/image';

const Header: React.FC = () => {
  return (
    <header className="bg-primary text-white p-4 shadow-md flex items-center">
      <div className="flex items-center">
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-3">
          <div className="text-primary font-bold text-xl">DM</div>
        </div>
        <div>
          <h1 className="text-xl font-bold">Don Mariño</h1>
          <p className="text-sm opacity-80">Chatbot de Recordatorios</p>
        </div>
      </div>
      <div className="ml-auto text-sm opacity-70">
        ¡Formación para la Excelencia!
      </div>
    </header>
  );
};

export default Header;
