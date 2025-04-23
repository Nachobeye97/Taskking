"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function ProyectoPersonal() {
  const [projectData, setProjectData] = useState<any[]>([]);
  const [task, setTask] = useState<string>("");
  const [taskStatus, setTaskStatus] = useState<string>("todo");
  const [tasks, setTasks] = useState<any[]>([]);
  const [newProjectName, setNewProjectName] = useState<string>("");
  const [newProjectDescription, setNewProjectDescription] =
    useState<string>("");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );
  const [showTaskOptions, setShowTaskOptions] = useState<string | null>(null);
  const [showProjectOptions, setShowProjectOptions] = useState<string | null>(
    null
  );
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [editingTaskName, setEditingTaskName] = useState<string>("");
  const [selectedProjectIdForEdit, setSelectedProjectIdForEdit] = useState<
    string | null
  >(null);
  const [editingProjectName, setEditingProjectName] = useState<string>("");
  const router = useRouter();

  const fetchProjectData = async () => {
    const session = await supabase.auth.getSession();

    if (session.data?.session?.user) {
      const { data: projects, error: projectError } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", session.data.session.user.id)
        .order("created_at", { ascending: true }); // Order by creation time

      if (projectError) {
        console.error("Error al obtener proyectos", projectError.message);
      } else {
        setProjectData(projects || []);
        if (projects && projects.length > 0) {
          setSelectedProjectId(projects[0].id);
          fetchTasks(projects[0].id);
        }
      }
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, []);

  const fetchTasks = async (projectId: string) => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true }); // Order by creation time

    if (error) {
      console.error("Error al obtener tareas", error.message);
    } else {
      setTasks(data || []);
    }
  };

  const handleAddTask = async () => {
    if (!task || !selectedProjectId) return;

    const session = await supabase.auth.getSession();

    if (session.data?.session?.user) {
      const user = session.data.session.user;

      const { data, error } = await supabase.from("tasks").insert([
        {
          task_name: task,
          project_id: selectedProjectId,
          user_id: user.id,
          status: taskStatus,
        },
      ]);

      if (error) {
        console.error("Error al agregar tarea", error.message);
      } else {
        setTasks((prevTasks) => [...prevTasks, data ? data[0] : {}]);
        setTask("");
        setTaskStatus("todo");
        fetchTasks(selectedProjectId); // Fetch to maintain order
      }
    }
  };

  const handleAddProject = async () => {
    const session = await supabase.auth.getSession();

    if (session.data?.session?.user) {
      const user = session.data.session.user;

      const { data, error } = await supabase.from("projects").insert([
        {
          project_name: newProjectName,
          project_description: newProjectDescription,
          user_id: user.id,
        },
      ]);

      if (error) {
        console.error("Error al agregar proyecto", error.message);
      } else {
        setProjectData((prevData) => [...prevData, data ? data[0] : {}]);
        setNewProjectName("");
        setNewProjectDescription("");
        fetchProjectData(); // Fetch to maintain order
      }
    }
  };

  const handleSelectProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    setTask("");
    setTaskStatus("todo");
    setSelectedTaskId(null);
    setEditingTaskName("");
    setSelectedProjectIdForEdit(null);
    setEditingProjectName("");
    fetchTasks(projectId);
  };

  const handleDeleteTask = async (taskId: string) => {
    const { error } = await supabase.from("tasks").delete().eq("id", taskId);

    if (error) {
      console.error("Error al eliminar tarea", error.message);
    } else {
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", projectId);

    if (error) {
      console.error("Error al eliminar proyecto", error.message);
    } else {
      setProjectData((prevData) =>
        prevData.filter((project) => project.id !== projectId)
      );
      if (selectedProjectId === projectId) {
        setSelectedProjectId(null);
        setTasks([]);
      }
    }
  };

  const handleTaskEdit = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("Editar Tarea clicked", taskId);
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      setSelectedTaskId(taskId);
      setEditingTaskName(task.task_name);
    }
  };

  const handleTaskNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingTaskName(e.target.value);
  };

  const handleTaskNameSave = async (taskId: string) => {
    const { error } = await supabase
      .from("tasks")
      .update({ task_name: editingTaskName })
      .eq("id", taskId);

    if (error) {
      console.error("Error al actualizar tarea", error.message);
    } else {
      setTasks((prevTasks) =>
        prevTasks.map((t) =>
          t.id === taskId ? { ...t, task_name: editingTaskName } : t
        )
      );
      setSelectedTaskId(null);
      setEditingTaskName("");
      // Removed fetchTasks to prevent reordering
    }
  };

  const handleProjectEdit = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("Editar Proyecto clicked", projectId);
    const project = projectData.find((p) => p.id === projectId);
    if (project) {
      setSelectedProjectIdForEdit(projectId);
      setEditingProjectName(project.project_name);
    }
  };

  const handleProjectNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingProjectName(e.target.value);
  };

  const handleProjectNameSave = async (projectId: string) => {
    const { error } = await supabase
      .from("projects")
      .update({ project_name: editingProjectName })
      .eq("id", projectId);

    if (error) {
      console.error("Error al actualizar proyecto", error.message);
    } else {
      setProjectData((prevData) =>
        prevData.map((p) =>
          p.id === projectId ? { ...p, project_name: editingProjectName } : p
        )
      );
      setSelectedProjectIdForEdit(null);
      setEditingProjectName("");
      // Removed fetchProjectData to prevent reordering
    }
  };

  const filteredTasks = (status: string) =>
    tasks.filter((task: any) => task.status === status);

  return (
    <div className="bg-[#DFDED4] p-6 min-h-screen flex">
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
                    : "bg-[#f5f5f5] text-black"
                }`}
                onClick={() => handleSelectProject(project.id)}
              >
                <div className="flex justify-between items-center">
                  {selectedProjectIdForEdit === project.id ? (
                    <input
                      type="text"
                      value={editingProjectName}
                      onChange={handleProjectNameChange}
                      onKeyDown={(e) => {
                        if (e.key === "Enter")
                          handleProjectNameSave(project.id);
                      }}
                      onBlur={() => handleProjectNameSave(project.id)}
                      className="p-1 w-3/4 border border-primary bg-[#f5f5f5] text-primary focus:outline-none focus:border-primary"
                      autoFocus
                    />
                  ) : (
                    <span className="w-3/4">{project.project_name}</span>
                  )}
                  <div className="dropdown dropdown-bottom dropdown-end">
                    <div tabIndex={0} role="button" className="btn m-1">
                      ...
                    </div>
                    <ul
                      tabIndex={0}
                      className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow-sm"
                    >
                      <li>
                        <button
                          onClick={(e) => handleProjectEdit(project.id, e)}
                          className="block text-primary mb-2"
                        >
                          Editar Proyecto
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => handleDeleteProject(project.id)}
                          className="block text-red-500"
                        >
                          Eliminar Proyecto
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No tienes proyectos</p>
        )}
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

      <div className="flex-1 p-4 bg-white shadow-lg rounded-lg">
        <h2 className="text-2xl font-bold text-primary mb-4">
          {selectedProjectId ? "Tareas" : "Selecciona un Proyecto"}
        </h2>

        {selectedProjectId ? (
          <div>
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
                Añadir Tarea
              </button>
            </div>

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
                        className="p-1 mb-2 bg-white rounded-lg shadow-sm flex justify-between items-center"
                      >
                        {selectedTaskId === task.id ? (
                          <input
                            type="text"
                            value={editingTaskName}
                            onChange={handleTaskNameChange}
                            onKeyDown={(e) => {
                              if (e.key === "Enter")
                                handleTaskNameSave(task.id);
                            }}
                            onBlur={() => handleTaskNameSave(task.id)}
                            className="p-1 w-3/4 border border-primary bg-[#f5f5f5] text-primary focus:outline-none focus:border-primary"
                            autoFocus
                          />
                        ) : (
                          <span className="w-3/4">{task.task_name}</span>
                        )}
                        <div className="dropdown dropdown-bottom dropdown-end">
                          <div tabIndex={0} role="button" className="btn m-1">
                            ...
                          </div>
                          <ul
                            tabIndex={0}
                            className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow-sm"
                          >
                            <li>
                              <button
                                onClick={(e) => handleTaskEdit(task.id, e)}
                                className="block text-primary mb-2"
                              >
                                Editar Tarea
                              </button>
                            </li>
                            <li>
                              <button
                                onClick={() => handleDeleteTask(task.id)}
                                className="block text-red-500"
                              >
                                Eliminar Tarea
                              </button>
                            </li>
                          </ul>
                        </div>
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
