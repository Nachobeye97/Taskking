"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient"; // Asegúrate de tener la instancia de Supabase configurada correctamente
import { useRouter } from "next/navigation";
import "./profile.css"; // Asegúrate de que la ruta del archivo CSS es correcta

export default function Profile() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Función para manejar el cambio de imagen de perfil
  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `profile_images/${fileName}`;

    setIsLoading(true);

    // Subir la imagen a Supabase Storage
    const { data, error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { cacheControl: "3600", upsert: false });

    if (uploadError) {
      alert("Error al subir la imagen: " + uploadError.message);
      setIsLoading(false);
      return;
    }

    // Obtener la URL pública del archivo subido
    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    // Usar la URL pública de la imagen
    setImageUrl(urlData.publicUrl); // Cambié 'publicURL' a 'publicUrl'
    setIsLoading(false);
  };

  // Aquí puedes manejar los datos del usuario (Nombre, Apellidos, etc.) y la actualización
  const handleUpdateProfile = async () => {
    // Este es un ejemplo, ajusta según tu lógica para guardar el nombre, apellidos, etc.
    const { error } = await supabase.auth.updateUser({
      data: { imageUrl },
    });

    if (error) {
      alert("Error al actualizar el perfil: " + error.message);
    } else {
      alert("¡Perfil actualizado correctamente!");
    }
  };

  return (
    <div className="profile-container">
      {/* Imagen de perfil */}
      <div className="profile-image-container">
        <img
          src={imageUrl || "/path/to/your/placeholder-image.png"}
          alt="Foto de perfil"
          className="profile-image"
        />
        <button className="upload-button">
          {isLoading ? "Subiendo..." : "Actualizar Foto de Perfil"}
          <input
            type="file"
            accept="image/png, image/jpeg, image/jpg"
            onChange={handleImageUpload}
            className="file-input"
          />
        </button>
      </div>

      {/* Información del perfil */}
      <div className="profile-info">
        <label>Nombre</label>
        <input
          type="text"
          placeholder="Escribe tu nombre"
          className="input-field"
        />
        <label>Apellidos</label>
        <input
          type="text"
          placeholder="Escribe tus apellidos"
          className="input-field"
        />
        <label>Correo electrónico</label>
        <input
          type="email"
          placeholder="Escribe tu correo"
          className="input-field"
        />
        <label>Teléfono</label>
        <input
          type="text"
          placeholder="Escribe tu número de teléfono"
          className="input-field"
        />

        {/* Botón para actualizar el perfil */}
        <button onClick={handleUpdateProfile} className="submit-button">
          Actualizar Perfil
        </button>
      </div>
    </div>
  );
}
