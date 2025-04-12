'use client';

import { motion } from 'framer-motion';
import styles from './home.module.css'; // Asegúrate de que la ruta sea correcta

export default function Home() {
  return (
    // Fondo completo con gradiente
    <div className={styles['page-container']}>
      {/* Caja transparente que contiene el título y el subtítulo */}
      <motion.div
        className={styles['content-box']} // Caja transparente
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        {/* Título con animación */}
        <motion.h1
          className={styles['title']}
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Taskking
        </motion.h1>

        {/* Subtítulo con animación */}
        <motion.p
          className={styles['subtitle']}
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
