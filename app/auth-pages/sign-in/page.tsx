"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert("Error al iniciar sesión: " + error.message);
    } else {
      router.push("/auth-pages/dashboard"); // Redirige a una página protegida o al home
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#DFDED4] p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-4 text-center text-[#3f51b5]">
          Iniciar sesión
        </h1>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-4 rounded-lg mb-4 border border-[#e0e0e0] bg-[#f5f5f5] text-black focus:outline-none focus:border-[#3f51b5] transition duration-300"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-4 rounded-lg mb-4 border border-[#e0e0e0] bg-[#f5f5f5] text-black focus:outline-none focus:border-[#3f51b5] transition duration-300"
          />
          <button type="submit" className="btn btn-dash btn-primary">
            Iniciar sesión
          </button>
        </form>

        <p className="mt-4 text-center text-[#3f51b5]">
          ¿No tienes cuenta?{" "}
          <Link
            href="/auth-pages/sign-up"
            className="text-[#3f51b5] underline hover:text-[#42a5f5]"
          >
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
}
