"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient"; // Asegúrate de tener la instancia de Supabase configurada correctamente
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // Estado para la confirmación de la contraseña
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); // Para manejar los errores
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar que las contraseñas coinciden
    if (password !== confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden");
      return; // Evitar registrar si no coinciden
    }

    // Intentamos registrar al usuario
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
      { email, password }
    );

    if (signUpError) {
      setErrorMessage("Error al registrarse: " + signUpError.message);
    } else {
      // Obtener el usuario recién registrado
      const user = signUpData.user;

      if (user) {
        // Registrar la información adicional del usuario en la tabla 'users' de Supabase
        const { error: insertError } = await supabase.from("users").insert([
          {
            id: user.id, // Usamos el ID del usuario autenticado
            first_name: firstName,
            last_name: lastName,
            phone: phone,
            email: user.email, // Ahora agregamos el email
          },
        ]);

        if (insertError) {
          setErrorMessage(
            "Error al guardar los datos del usuario: " + insertError.message
          );
        } else {
          alert(
            "¡Registro exitoso! Revisa tu correo para verificar tu cuenta."
          );
          router.push("/auth-pages/sign-in"); // Redirige a la página de Sign In
        }
      } else {
        setErrorMessage("Error al obtener los datos del usuario");
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#DFDED4] p-6">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center text-[#FFA500]">
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
            className="p-4 rounded-lg mb-4 border border-[#e0e0e0] bg-[#f5f5f5] text-black focus:outline-none focus:border-[#FFA500] transition duration-300"
          />
          <input
            type="text"
            placeholder="Apellidos"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="p-4 rounded-lg mb-4 border border-[#e0e0e0] bg-[#f5f5f5] text-black focus:outline-none focus:border-[#FFA500] transition duration-300"
          />
          <input
            type="text"
            placeholder="Teléfono"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="p-4 rounded-lg mb-4 border border-[#e0e0e0] bg-[#f5f5f5] text-black focus:outline-none focus:border-[#FFA500] transition duration-300"
          />
          <input
            type="email"
            placeholder="Correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-4 rounded-lg mb-4 border border-[#e0e0e0] bg-[#f5f5f5] text-black focus:outline-none focus:border-[#FFA500] transition duration-300"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-4 rounded-lg mb-4 border border-[#e0e0e0] bg-[#f5f5f5] text-black focus:outline-none focus:border-[#FFA500] transition duration-300"
          />
          <input
            type="password"
            placeholder="Confirmar Contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="p-4 rounded-lg mb-4 border border-[#e0e0e0] bg-[#f5f5f5] text-black focus:outline-none focus:border-[#FFA500] transition duration-300"
          />
          <button type="submit" className="btn btn-dash btn-warning">
            Registrarse
          </button>
        </form>
        <p className="mt-4 text-center text-[#FFA500]">
          ¿Ya tienes cuenta?{" "}
          <Link
            href="/auth-pages/sign-in"
            className="text-[#FFA500] hover:text-[#42a5f5] underline"
          >
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </div>
  );
}
