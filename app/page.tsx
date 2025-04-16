"use client";

import { motion } from "framer-motion";

export default function Home() {
  return (
    // Fondo completo con color #DFDED4
    <div className="min-h-screen bg-[#DFDED4] flex justify-center items-start p-6">
      {/* Caja transparente que contiene el título y el subtítulo */}
      <motion.div
        className="bg-transparent text-center w-full max-w-4xl p-4 mt-0" // Subido a la parte superior
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        {/* Título con animación */}
        <motion.h1
          className="text-7xl font-bold text-primary uppercase tracking-wider mb-4 mt-20 text-shadow-lg" // Título más cerca de la parte superior
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Taskking
        </motion.h1>

        {/* Subtítulo con animación */}
        <motion.p
          className="text-2xl text-primary opacity-80 mb-6 tracking-wide max-w-xl mx-auto"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          Bienvenido a Taskking, la mejor plataforma para gestionar tus tareas.
        </motion.p>
      </motion.div>
    </div>
  );
}
