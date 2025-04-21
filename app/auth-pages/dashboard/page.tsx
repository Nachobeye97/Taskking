"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion"; // Importamos framer-motion
import "../../globals.css";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient"; // Asegúrate de que tu importación de supabase esté correcta

export default function Dashboard() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  // Función para cerrar sesión usando el botón que ya has creado
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut(); // Cerrar sesión con Supabase

    if (error) {
      console.error("Error al cerrar sesión:", error.message);
    } else {
      router.push("/auth-pages/sign-in"); // Redirigir al login después de cerrar sesión
    }
  };

  return (
    <div className="bg-[#DFDED4]">
      {/* Menú de opciones (perfil y cerrar sesión) */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="absolute top-1/8 right-5 w-14 h-14 text-primary rounded-full flex items-center justify-center text-xl font-semibold shadow-lg transition-all duration-300 ease-in-out border-2 border-primary hover:scale-110 hover:bg-primary hover:text-white"
        style={{ position: "absolute", top: "10%", right: "5%" }}
      >
        T {/* Menú desplegable */}
      </button>

      {/* Menú desplegable */}
      {isMenuOpen && (
        <ul
          className="dropdown menu w-52 rounded-box bg-transparent shadow-sm p-2"
          id="popover-1"
          style={{ position: "absolute", top: "8.7rem", right: "6%" }}
        >
          <li>
            <Link
              className="btn btn-outline py-2 px-4 text-x2 transform transition duration-300 ease-out border-transparent text-primary hover:bg-primary hover:text-white"
              href={"/auth-pages/profile"}
            >
              Perfil
            </Link>
          </li>
          <li>
            <button
              className="btn btn-outline py-2 px-4 text-x2 transform transition duration-300 ease-out border-transparent text-primary hover:bg-primary hover:text-white"
              onClick={handleLogout} // Cerrar sesión
            >
              Cerrar sesión
            </button>
          </li>
        </ul>
      )}

      {/* Título y la pregunta */}
      <motion.div
        className="text-center mt-[230px]"
        initial={{ opacity: 0, y: -100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <motion.h1
          className="text-4xl font-bold mb-6 text-primary uppercase"
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          ¿Con qué te gustaría trabajar?
        </motion.h1>
        <motion.p
          className="text-lg mb-10 opacity-80 tracking-wide text-primary"
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          Aquí puedes elegir entre las opciones.
        </motion.p>
      </motion.div>

      {/* Opciones de trabajo */}
      <motion.div
        className="flex gap-6 justify-center mt-6"
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        <motion.button
          className="btn btn-outline py-3 px-6 text-xl transform transition duration-300 ease-out border-2 border-primary text-primary hover:bg-primary hover:text-white"
          onClick={() => router.push("/proyecto-personal")}
        >
          Proyecto Personal
        </motion.button>

        <motion.button
          className="btn btn-outline py-3 px-6 text-xl transform transition duration-300 ease-out border-2 border-primary text-primary hover:bg-primary hover:text-white"
          onClick={() => router.push("/empresa")}
        >
          Empresa
        </motion.button>
      </motion.div>
    </div>
  );
}
