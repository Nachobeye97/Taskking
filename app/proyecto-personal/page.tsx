"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient"; // Asegúrate de que tu importación de supabase esté correcta
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function ProyectoPersonal() {
  const [projectData, setProjectData] = useState<any[]>([]); // Inicializamos como un array vacío
  const [task, setTask] = useState<string>(""); // Tarea que el usuario quiere agregar
  const [taskStatus, setTaskStatus] = useState<string>("todo"); // Estado inicial de la tarea
  const [tasks, setTasks] = useState<any[]>([]); // Estado de las tareas del proyecto
  const [newProjectName, setNewProjectName] = useState<string>(""); // Nombre del nuevo proyecto
  const [newProjectDescription, setNewProjectDescription] =
    useState<string>(""); // Descripción del nuevo proyecto
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  ); // Proyecto seleccionado
  const router = useRouter();

  useEffect(() => {
    const fetchProjectData = async () => {
      const session = await supabase.auth.getSession();

      if (session.data?.session?.user) {
        const { data: projects, error: projectError } = await supabase
          .from("projects")
          .select("*")
          .eq("user_id", session.data.session.user.id); // Filtrar los proyectos por ID de usuario

        if (projectError) {
          console.error("Error al obtener proyectos", projectError.message);
        } else {
          setProjectData(projects || []); // Establecer proyectos en el estado
          if (projects && projects.length > 0) {
            setSelectedProjectId(projects[0].id); // Establecer el primer proyecto como seleccionado
            fetchTasks(projects[0].id); // Obtener las tareas asociadas al primer proyecto
          }
        }
      }
    };

    fetchProjectData(); // Llamada inicial para obtener datos de proyectos y tareas
  }, []);

  const fetchTasks = async (projectId: string) => {
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

  const handleAddTask = async () => {
    if (!task || !selectedProjectId) return; // Si no hay tarea o no hay proyecto

    const session = await supabase.auth.getSession(); // Obtener sesión del usuario

    if (session.data?.session?.user) {
      const user = session.data.session.user; // Obtener usuario

      const { data, error } = await supabase.from("tasks").insert([
        {
          task_name: task,
          project_id: selectedProjectId,
          user_id: user.id, // Usar el ID del usuario
          status: taskStatus, // Estado de la tarea
        },
      ]);

      if (error) {
        console.error("Error al agregar tarea", error.message);
      } else {
        setTasks((prevTasks) => [...prevTasks, data ? data[0] : {}]); // Añadir la nueva tarea al estado
        setTask(""); // Limpiar campo de tarea
        setTaskStatus("todo"); // Resetear el estado de la tarea a "todo"
      }
    }
  };

  const handleAddProject = async () => {
    const session = await supabase.auth.getSession(); // Obtener sesión del usuario

    if (session.data?.session?.user) {
      const user = session.data.session.user; // Obtener usuario

      const { data, error } = await supabase.from("projects").insert([
        {
          project_name: newProjectName,
          project_description: newProjectDescription,
          user_id: user.id, // Usar el ID del usuario
        },
      ]);

      if (error) {
        console.error("Error al agregar proyecto", error.message);
      } else {
        setProjectData((prevData) => [...prevData, data ? data[0] : {}]); // Añadir nuevo proyecto al estado
        setNewProjectName(""); // Limpiar campo de nombre
        setNewProjectDescription(""); // Limpiar campo de descripción
      }
    }
  };

  const handleSelectProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    fetchTasks(projectId); // Obtener tareas del proyecto seleccionado
  };

  // Filtrar las tareas por su estado
  const filteredTasks = (status: string) =>
    tasks.filter((task: any) => task.status === status);

  return (
    <div className="bg-[#DFDED4] p-6 min-h-screen flex">
      {/* Barra de proyectos */}
      <div className="w-1/4 p-4 bg-white shadow-lg rounded-lg mr-6">
        <h2 className="text-2xl font-bold text-primary mb-4">Proyectos</h2>
        {projectData.length > 0 ? (
          <ul>
            {projectData.map((project: any) => (
              <li
                key={project.id}
                className={`p-2 mb-2 rounded-lg cursor-pointer ${
                  selectedProjectId === project.id
                    ? "bg-primary text-white"
                    : "bg-[#f5f5f5] text-primary"
                }`}
                onClick={() => handleSelectProject(project.id)}
              >
                {project.project_name}
              </li>
            ))}
          </ul>
        ) : (
          <p>No tienes proyectos</p>
        )}

        {/* Formulario para agregar un nuevo proyecto */}
        <div className="mt-6">
          <input
            type="text"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            placeholder="Nombre del Proyecto"
            className="p-2 w-full mb-2 border border-primary bg-[#f5f5f5] text-primary focus:outline-none focus:border-primary"
          />
          <input
            type="text"
            value={newProjectDescription}
            onChange={(e) => setNewProjectDescription(e.target.value)}
            placeholder="Descripción"
            className="p-2 w-full mb-2 border border-primary bg-[#f5f5f5] text-primary focus:outline-none focus:border-primary"
          />
          <button
            onClick={handleAddProject}
            className="w-full bg-primary text-white py-2 rounded-lg hover:bg-[#DFDED4] transition-all"
          >
            Añadir Proyecto
          </button>
        </div>
      </div>

      {/* Área principal para las tareas */}
      <div className="flex-1 p-4 bg-white shadow-lg rounded-lg">
        <h2 className="text-2xl font-bold text-primary mb-4">
          {selectedProjectId ? "Tareas" : "Selecciona un Proyecto"}
        </h2>

        {selectedProjectId ? (
          <div>
            {/* Formulario para añadir tarea y seleccionar columna */}
            <div className="mb-4">
              <input
                type="text"
                value={task}
                onChange={(e) => setTask(e.target.value)}
                placeholder="Añadir tarea"
                className="p-2 w-full mb-2 border border-primary bg-[#f5f5f5] text-primary focus:outline-none focus:border-primary"
              />
              <select
                value={taskStatus}
                onChange={(e) => setTaskStatus(e.target.value)}
                className="p-2 w-full mb-4 border border-primary bg-[#f5f5f5] text-primary focus:outline-none focus:border-primary"
              >
                <option value="todo">Lista de Tareas</option>
                <option value="inProgress">En Proceso</option>
                <option value="done">Hecho</option>
                <option value="paused">Pausadas</option>
              </select>
              <button
                onClick={handleAddTask}
                className="w-full bg-primary text-white py-2 rounded-lg hover:bg-[#DFDED4] transition-all"
              >
                Añadir tarea
              </button>
            </div>

            {/* Columnas de tareas */}
            <div className="grid grid-cols-4 gap-4">
              {["todo", "inProgress", "done", "paused"].map((status, index) => (
                <div key={index} className="bg-[#f5f5f5] p-4 rounded-lg">
                  <h3 className="font-bold text-primary">
                    {status === "todo"
                      ? "Lista de Tareas"
                      : status === "inProgress"
                        ? "En Proceso"
                        : status === "done"
                          ? "Hecho"
                          : "Pausadas"}
                  </h3>
                  <ul className="mt-4">
                    {filteredTasks(status).map((task) => (
                      <li
                        key={task.id}
                        className="p-2 mb-2 bg-white rounded-lg shadow-sm"
                      >
                        {task.task_name}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-center text-primary">
            Selecciona un proyecto para ver las tareas.
          </p>
        )}
      </div>
    </div>
  );
}
