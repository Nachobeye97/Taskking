'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion'; // Importamos framer-motion
import './dashboard.css'; // Importamos el archivo CSS

export default function Dashboard() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    router.push('/auth-pages/sign-in'); // Redirigir al login después de cerrar sesión
  };

  return (
    <div className="dashboard-container">
      {/* Menú de opciones (perfil y cerrar sesión) */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="menu-button"
      >
        <span className="text-xl font-semibold">T</span> {/* Menú desplegable */}
      </button>

      {/* Menú desplegable */}
      {isMenuOpen && (
        <ul className="menu-dropdown">
          <li
            className="p-2 cursor-pointer hover:bg-gray-200"
            onClick={() => router.push('/auth-pages/profile')} // Redirige al perfil
          >
            Perfil
          </li>
          <li
            className="p-2 cursor-pointer hover:bg-gray-200"
            onClick={handleLogout} // Cerrar sesión
          >
            Cerrar sesión
          </li>
        </ul>
      )}

      {/* Título y la pregunta */}
      <motion.div
        className="question-container"
        initial={{ opacity: 0, y: -100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <motion.h1
          className="dashboard-title"
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          ¿Con qué te gustaría trabajar?
        </motion.h1>
        <motion.p
          className="dashboard-description"
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          Aquí puedes elegir entre las opciones.
        </motion.p>
      </motion.div>

      {/* Opciones de trabajo */}
      <motion.div
        className="options-container"
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        <motion.button
          className="option-button"
          onClick={() => router.push('/proyecto-personal')}
        >
          Proyecto Personal
        </motion.button>
        <motion.button
          className="option-button"
          onClick={() => router.push('/empresa')}
        >
          Empresa
        </motion.button>
      </motion.div>
    </div>
  );
}
