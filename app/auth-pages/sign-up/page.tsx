"use client";

import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (loading) return; // Evitar múltiples envíos

      console.log("Attempting signup with email:", email); // Debugging
      setErrorMessage("");
      setLoading(true);

      // Validar que las contraseñas coinciden
      if (password !== confirmPassword) {
        setErrorMessage("Las contraseñas no coinciden");
        setLoading(false);
        return;
      }

      // Validar campos obligatorios
      if (!email || !password || !firstName || !lastName) {
        setErrorMessage("Por favor, completa todos los campos obligatorios");
        setLoading(false);
        return;
      }

      try {
        const { data: signUpData, error: signUpError } =
          await supabase.auth.signUp({
            email,
            password,
          });

        if (signUpError) {
          throw new Error(signUpError.message);
        }

        const user = signUpData.user;

        if (user) {
          const { error: insertError } = await supabase.from("users").insert([
            {
              id: user.id,
              first_name: firstName,
              last_name: lastName,
              phone: phone,
              email: user.email,
            },
          ]);

          if (insertError) {
            throw new Error(
              "Error al guardar los datos del usuario: " + insertError.message
            );
          }

          alert(
            "¡Registro exitoso! Revisa tu correo para verificar tu cuenta."
          );
          router.push("/auth-pages/sign-in");
        } else {
          throw new Error("Error al obtener los datos del usuario");
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Error desconocido";
        setErrorMessage(message);
        if (message.includes("429")) {
          setErrorMessage(
            "Demasiadas solicitudes. Por favor, espera unos minutos e intenta de nuevo."
          );
        }
      } finally {
        setLoading(false);
      }
    },
    [
      email,
      password,
      confirmPassword,
      firstName,
      lastName,
      phone,
      loading,
      router,
    ]
  );

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#DFDED4] p-6">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-lg mt-0">
        <h1 className="text-2xl font-bold mb-4 text-center text-primary">
          Registrarse
        </h1>
        {errorMessage && (
          <p className="text-red-500 text-center mb-4">{errorMessage}</p>
        )}
        <form onSubmit={handleSignUp} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Nombre"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="p-4 rounded-lg mb-4 border border-primary bg-[#f5f5f5] text-black focus:outline-none focus:border-primary transition duration-300"
            required
            disabled={loading}
          />
          <input
            type="text"
            placeholder="Apellidos"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="p-4 rounded-lg mb-4 border border-primary bg-[#f5f5f5] text-black focus:outline-none focus:border-primary transition duration-300"
            required
            disabled={loading}
          />
          <input
            type="text"
            placeholder="Teléfono"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="p-4 rounded-lg mb-4 border border-primary bg-[#f5f5f5] text-black focus:outline-none focus:border-primary transition duration-300"
            disabled={loading}
          />
          <input
            type="email"
            placeholder="Correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-4 rounded-lg mb-4 border border-primary bg-[#f5f5f5] text-black focus:outline-none focus:border-primary transition duration-300"
            required
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-4 rounded-lg mb-4 border border-primary bg-[#f5f5f5] text-black focus:outline-none focus:border-primary transition duration-300"
            required
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Confirmar Contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="p-4 rounded-lg mb-4 border border-primary bg-[#f5f5f5] text-black focus:outline-none focus:border-primary transition duration-300"
            required
            disabled={loading}
          />
          <button
            type="submit"
            className={`px-6 py-2 border-2 border-primary text-primary rounded-lg shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-primary ${
              loading
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-primary hover:text-white"
            }`}
            disabled={loading}
          >
            {loading ? "Registrando..." : "Registrarse"}
          </button>
        </form>
        <p className="mt-4 text-center text-primary">
          ¿Ya tienes cuenta?{" "}
          <Link
            href="/auth-pages/sign-in"
            className="text-primary hover:text-[#42a5f5] underline"
          >
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </div>
  );
}
