"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient"; // Asegúrate de que la ruta esté correcta
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function ProyectoPersonal() {
  const [projectData, setProjectData] = useState<any[]>([]); // Inicializamos como un array vacío
  const [task, setTask] = useState<string>(""); // Tarea que el usuario quiere agregar
  const [tasks, setTasks] = useState<any[]>([]); // Estado de las tareas del proyecto
  const [newProjectName, setNewProjectName] = useState<string>(""); // Nombre del nuevo proyecto
  const [newProjectDescription, setNewProjectDescription] =
    useState<string>(""); // Descripción del nuevo proyecto
  const router = useRouter();

  useEffect(() => {
    const fetchProjectData = async () => {
      const { data: session, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError) {
        console.error("Error al obtener sesión:", sessionError.message);
        return;
      }

      // Verificamos si la sesión y el usuario existen
      if (session?.session?.user) {
        const userEmail = session.session.user.email; // Obtener el correo del usuario

        if (userEmail) {
          const { data: projects, error: projectError } = await supabase
            .from("projects")
            .select("*")
            .eq("email", userEmail); // Usamos el correo del usuario para filtrar los proyectos

          if (projectError) {
            console.error("Error al obtener proyectos", projectError.message);
          } else {
            setProjectData(projects || []); // Establecer proyectos en el estado
            if (projects && projects.length > 0) {
              fetchTasks(projects[0].id); // Obtener las tareas asociadas al primer proyecto
            }
          }
        }
      }
    };

    const fetchTasks = async (projectId: number) => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("project_id", projectId); // Obtener tareas asociadas al proyecto

      if (error) {
        console.error("Error al obtener tareas", error.message);
      } else {
        setTasks(data || []); // Establecer las tareas si se obtuvieron correctamente
      }
    };

    fetchProjectData(); // Llamada inicial para obtener datos de proyectos y tareas
  }, []);

  const handleAddTask = async () => {
    if (!task || !projectData) return; // Si no hay tarea o no hay proyecto

    const { data: session, error: sessionError } =
      await supabase.auth.getSession(); // Obtener sesión del usuario

    if (sessionError) {
      console.error("Error al obtener sesión:", sessionError.message);
      return;
    }

    // Verificamos si la sesión y el usuario existen
    if (session?.session?.user) {
      const userEmail = session.session.user.email; // Obtener correo del usuario

      const { data, error } = await supabase.from("tasks").insert([
        {
          task_name: task,
          project_id: projectData[0].id,
          email: userEmail, // Usar el correo del usuario para asociar la tarea
        },
      ]);

      if (error) {
        console.error("Error al agregar tarea", error.message);
      } else {
        setTasks((prevTasks) => [...prevTasks, data?.[0]]); // Añadir la nueva tarea al estado
        setTask(""); // Limpiar campo de tarea
      }
    } else {
      console.error("Usuario no autenticado.");
    }
  };

  const handleAddProject = async () => {
    const { data: session, error: sessionError } =
      await supabase.auth.getSession(); // Obtener sesión del usuario

    if (sessionError) {
      console.error("Error al obtener sesión:", sessionError.message);
      return;
    }

    // Verificamos si la sesión y el usuario existen
    if (session?.session?.user) {
      const userEmail = session.session.user.email; // Obtener correo del usuario

      const { data, error } = await supabase.from("projects").insert([
        {
          project_name: newProjectName,
          project_description: newProjectDescription,
          email: userEmail, // Usar el correo del usuario para asociar el proyecto
        },
      ]);

      if (error) {
        console.error("Error al agregar proyecto", error.message);
      } else {
        setProjectData((prevData) => [...prevData, data?.[0]]); // Añadir nuevo proyecto al estado
        setNewProjectName(""); // Limpiar campo de nombre
        setNewProjectDescription(""); // Limpiar campo de descripción
      }
    } else {
      console.error("Usuario no autenticado.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#DFDED4] p-6">
      {/* Botón para volver al dashboard */}
      <button
        onClick={() => router.push("/auth-pages/dashboard")}
        className="absolute top-20 left-12 text-primary bg-transparent border-2 border-primary px-4 py-2 rounded-md transition-all hover:bg-primary hover:text-white"
      >
        Volver
      </button>
      <div className="bg-[#DFDED4] p-6 min-h-screen">
        {/* Título y descripción */}
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <motion.h1 className="text-4xl font-bold mb-6 text-primary uppercase">
            Proyecto Personal
          </motion.h1>
        </motion.div>

        {/* Formulario para agregar un nuevo proyecto */}
        <motion.div
          className="flex justify-center mb-6"
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
        >
          <input
            type="text"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            placeholder="Nombre del Proyecto"
            className="p-4 rounded-lg border border-primary bg-[#f5f5f5] text-primary focus:outline-none focus:border-primary transition duration-300"
          />
          <input
            type="text"
            value={newProjectDescription}
            onChange={(e) => setNewProjectDescription(e.target.value)}
            placeholder="Descripción"
            className="p-4 rounded-lg border border-primary bg-[#f5f5f5] text-primary focus:outline-none focus:border-primary transition duration-300 ml-4"
          />
          <button
            onClick={handleAddProject}
            className="btn btn-outline text-primary ml-4"
          >
            Añadir Proyecto
          </button>
        </motion.div>

        {/* Tareas */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.7 }}
        >
          {tasks.length === 0 ? (
            <p className="text-center text-primary">
              No hay tareas en este proyecto.
            </p>
          ) : (
            tasks.map((task: any) => (
              <div key={task.id} className="bg-white p-4 rounded-lg shadow-md">
                <p>{task.task_name}</p>
              </div>
            ))
          )}
        </motion.div>

        {/* Formulario para agregar tarea */}
        <motion.div
          className="flex justify-center mt-6"
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <input
            type="text"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="Añadir tarea"
            className="p-4 rounded-lg border border-primary bg-[#f5f5f5] text-primary focus:outline-none focus:border-primary transition duration-300"
          />
          <button
            onClick={handleAddTask}
            className="btn btn-outline text-primary ml-4"
          >
            Añadir tarea
          </button>
        </motion.div>
      </div>
    </div>
  );
}
