"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient"; // Asegúrate de tener esta importación
import Link from "next/link"; // Usamos Link de Next.js
import { Button } from "./ui/button"; // Asegúrate de que tu botón esté correctamente importado

export default function AuthButton() {
  const [user, setUser] = useState<any | null>(null); // Guardar el usuario
  const [loading, setLoading] = useState(true); // Estado para manejar el loading
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // Para manejar errores

  // Hook para obtener el usuario actual de Supabase
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null); // Guardar el usuario de la sesión
      setLoading(false); // Terminar el loading
    };

    // Llamar la función para obtener la sesión al cargar el componente
    fetchUser();

    // Escuchar los cambios de autenticación y actualizar el estado en tiempo real
    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null); // Actualizar el estado con el nuevo usuario
    });
  }, []);

  // Función de cierre de sesión
  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      setErrorMessage("Error al cerrar sesión: " + error.message);
    }
  };

  if (loading) {
    return <div>Cargando...</div>; // Muestra un mensaje mientras se carga el estado de sesión
  }

  return (
    <>
      {user ? (
        // Mostrar cuando el usuario está autenticado
        <div className="flex items-center gap-4">
          <span className="text-primary font-bold text-lg">Bienvenido,</span>
          <span className="text-primary font-semibold text-lg">
            {user.email}
          </span>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSignOut();
            }}
          ></form>
        </div>
      ) : (
        // Mostrar los botones de inicio de sesión y registro cuando no hay un usuario
        <div className="flex gap-4">
          <Button
            size="sm"
            variant={"outline"}
            className="px-6 py-2 bg-primary text-white rounded-lg shadow-md transition-all hover:bg-primary focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <Link href="/auth-pages/sign-in">Iniciar sesión</Link>
          </Button>
          <Button
            size="sm"
            variant={"outline"}
            className="px-6 py-2 bg-primary text-white rounded-lg shadow-md transition-all hover:bg-primary focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <Link href="/auth-pages/sign-up">Registrarse</Link>
          </Button>
        </div>
      )}
    </>
  );
}
