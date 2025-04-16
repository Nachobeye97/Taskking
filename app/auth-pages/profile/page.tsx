"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient"; // Asegúrate de que la ruta esté correcta
import { useRouter } from "next/navigation";

export default function EditProfile() {
  const [userData, setUserData] = useState<any | null>(null); // Para almacenar los datos del usuario
  const [isLoading, setIsLoading] = useState(true); // Para manejar el estado de carga
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); // Para manejar los mensajes de error
  const router = useRouter();

  useEffect(() => {
    // Función para obtener los datos del usuario desde la tabla 'users'
    const fetchUserData = async () => {
      const session = await supabase.auth.getSession();

      if (session.data?.session?.user) {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("email", session.data.session.user.email); // Verificar con el correo

        if (error) {
          console.error("Error al obtener los datos del usuario", error);
          setErrorMessage("No se pudieron obtener los datos del usuario.");
        } else {
          setUserData(data[0]);
          setFirstName(data[0].first_name);
          setLastName(data[0].last_name);
          setPhone(data[0].phone);
          setEmail(data[0].email); // Inicializar con el correo actual
        }
      }

      setIsLoading(false);
    };

    fetchUserData();
  }, []);

  const handleUpdateProfile = async () => {
    const session = await supabase.auth.getSession();

    if (session.data?.session?.user) {
      // Actualizar los datos en la base de datos
      const { data, error } = await supabase
        .from("users")
        .update({
          first_name: firstName,
          last_name: lastName,
          phone: phone,
        })
        .eq("email", session.data.session.user.email); // Verificar por correo

      // Si hay un error al actualizar los datos de la tabla 'users'
      if (error) {
        setErrorMessage("Error al actualizar los datos del perfil.");
      } else {
        // Si el correo ha sido cambiado
        if (email !== session.data.session.user.email) {
          // Cambiar el correo electrónico en Supabase
          const { error: updateEmailError } = await supabase.auth.updateUser({
            email,
          });

          if (updateEmailError) {
            setErrorMessage("Error al actualizar el correo electrónico.");
            return;
          }

          // Si todo es exitoso, redirigir al usuario para que inicie sesión nuevamente
          alert(
            "Correo actualizado correctamente. Por favor, inicie sesión de nuevo."
          );
          supabase.auth.signOut(); // Cerrar sesión
          router.push("/auth-pages/sign-in"); // Redirigir a la página de login
        } else {
          alert("Perfil actualizado correctamente");
          router.push("/profile"); // Redirigir al perfil
        }
      }
    }
  };

  if (isLoading) {
    return <div>Cargando...</div>; // Mostrar un mensaje de carga mientras obtenemos los datos
  }

  if (errorMessage) {
    return <div>{errorMessage}</div>; // Mostrar mensaje de error si ocurre
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#DFDED4] p-6">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center text-[#FFA500]">
          Editar Perfil
        </h1>

        {/* Formulario editable */}
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="mb-4">
            <label className="block font-medium text-[#FFA500]">Nombre</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="p-4 rounded-lg mb-4 border border-[#e0e0e0] bg-[#f5f5f5] text-black focus:outline-none focus:border-[#FFA500] transition duration-300"
            />
          </div>

          <div className="mb-4">
            <label className="block font-medium text-[#FFA500]">
              Apellidos
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="p-4 rounded-lg mb-4 border border-[#e0e0e0] bg-[#f5f5f5] text-black focus:outline-none focus:border-[#FFA500] transition duration-300"
            />
          </div>

          <div className="mb-4">
            <label className="block font-medium text-[#FFA500]">Teléfono</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="p-4 rounded-lg mb-4 border border-[#e0e0e0] bg-[#f5f5f5] text-black focus:outline-none focus:border-[#FFA500] transition duration-300"
            />
          </div>

          <div className="mb-4">
            <label className="block font-medium text-[#FFA500]">
              Correo Electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="p-4 rounded-lg mb-4 border border-[#e0e0e0] bg-[#f5f5f5] text-black focus:outline-none focus:border-[#FFA500] transition duration-300"
            />
          </div>

          {/* Botón para actualizar el perfil */}
          <button
            type="button"
            onClick={handleUpdateProfile}
            className="bg-[#8e24aa] text-white py-3 px-6 rounded-lg hover:bg-[#7b1fa2] transition-all duration-300"
          >
            Guardar Cambios
          </button>
        </form>
      </div>
    </div>
  );
}
